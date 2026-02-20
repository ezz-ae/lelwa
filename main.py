import json
import re
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any

from dotenv import load_dotenv
import os

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, text
import google.generativeai as genai

from security import SecurityShield, RequestSignature
from tools import ToolExecutor
from channels import (
    save_channel_config,
    list_user_channels,
    create_resume_token,
    consume_resume_token,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
genai.configure(api_key=GEMINI_API_KEY)
shield = SecurityShield()
executor = ToolExecutor(engine)

os.makedirs("static", exist_ok=True)

app = FastAPI(title="Lelwa API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


# ── MODELS ─────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: str = "default"
    model: Optional[str] = "gemini"
    context: Optional[Dict[str, Any]] = {}


class ToolRequest(BaseModel):
    tool_name: str
    args: Dict[str, Any]
    user_id: str = "default"
    session_id: Optional[str] = None


class ChannelConfigRequest(BaseModel):
    channel: str
    config: Dict[str, str]
    user_id: str = "default"


class ResumeRequest(BaseModel):
    resume_token: str


# ── SYSTEM PROMPT ──────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are Lelwa. A real estate operator console for Dubai brokers.

When a broker drops a lead, listing, or request:
1. Call data tools as needed (search_properties, get_area_intelligence, calculate_mortgage, qualify_lead, etc.)
2. Then output ONLY a JSON object — no text before or after — in this exact schema:

{
  "reply": "1-2 sentences. What is prepared and ready for the broker. Operational only.",
  "prepared_blocks": [
    {
      "type": "reply|call_script|offer|contract|followups|summary",
      "title": "Short block title",
      "content": "Real content for this specific request. Not a template."
    }
  ],
  "prepared_actions": [
    {
      "id": "unique_snake_case_id",
      "label": "Send on WhatsApp",
      "tool_name": "send_whatsapp",
      "args": {"to_number": "+971...", "message_body": "exact text"},
      "requires": "connection"
    }
  ]
}

BLOCK TYPES — always include the relevant ones:
- reply: Prepared message to send to the client (WhatsApp or email)
- call_script: Step-by-step script for the broker to use on the call
- offer: Offer terms, pricing, key numbers
- contract: Contract terms or tenancy summary
- followups: Scheduled follow-up messages with exact timing
- summary: Market data, lead score, property data, area comparison

ALWAYS include:
- A "reply" block when a lead, client, or contact is mentioned
- A "call_script" block when calling or a phone number is mentioned
- An "offer" block when a budget, price, or purchase is mentioned
- A "summary" block when tool data is returned

ACTION RULES — requires field must be exact:
- send_whatsapp  → "connection"
- call_investor  → "connection"
- generate_offer, generate_rental_contract, generate_document_pdf → "confirmation"
- All other actions → "none"

CRITICAL — DO NOT call send_whatsapp or call_investor as function tools.
Instead, always put them in prepared_actions. The broker executes them manually.
Data tools (search, area, mortgage, qualify, market, location) CAN be called.

FORBIDDEN in any output text:
AI, Intelligence, Agent, Cognitive, Autonomous, Workflow, Automation,
Passwordless, Onboarding, Strategy, Assistant, Bot, Super, Pro, Plus,
Algorithm, System decided, We generate

USE ONLY:
Send, Call, Offer, Contract, Listing, Follow-up, Meeting, Ads, Reply,
Prepared, Confirm, Export, Review, Create, Viewing, Client, Lead,
Broker, Market, Property, Schedule, Done, Activity, Action
"""


# ── RESPONSE PARSER ────────────────────────────────────────────────────────

def _parse_broker_response(raw: str) -> dict:
    """Extract structured JSON from LLM response. Three fallbacks, never crashes."""
    text = raw.strip()

    # 1. Direct JSON
    if text.startswith("{"):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

    # 2. Fenced code block
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Any JSON object containing prepared_blocks
    m = re.search(r'\{.*?"prepared_blocks".*?\}', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass

    # 4. Fallback: wrap as summary block
    short = text[:400] + ("…" if len(text) > 400 else "")
    return {
        "reply": short,
        "prepared_blocks": [{"type": "summary", "title": "Prepared", "content": text}],
        "prepared_actions": [],
    }


# ── ENDPOINTS ──────────────────────────────────────────────────────────────

@app.post("/v1/chat")
async def chat_endpoint(req: ChatRequest, request: Request):
    """
    Main work feed entry point.

    Response contract:
      reply            str
      prepared_blocks  [{type, title, content}]
      prepared_actions [{id, label, tool_name, args, requires}]
      artifacts        []
      session_id       str
      threat_level     str
      timestamp        str
    """
    sig = RequestSignature(
        session_id=req.session_id,
        timestamp=datetime.now(),
        intent="chat",
        params={"message": req.message},
        ip_hash=hashlib.md5(request.client.host.encode()).hexdigest(),
    )
    assessment = shield.evaluate_request(sig)

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
        tools=executor.get_tool_definitions(),
    )

    chat = model.start_chat(history=[])
    response = chat.send_message(req.message)

    # Tool-call loop (max 5 rounds, data tools only)
    for _ in range(5):
        if not response.candidates or not response.candidates[0].content.parts:
            break
        has_func = any(
            hasattr(p, "function_call") and p.function_call.name
            for p in response.candidates[0].content.parts
        )
        if not has_func:
            break

        tool_responses = []
        for part in response.candidates[0].content.parts:
            if hasattr(part, "function_call") and part.function_call.name:
                call = part.function_call
                result = executor.execute(
                    call.name, dict(call.args), req.session_id, user_id=req.user_id
                )
                if assessment.threat_level != "clear":
                    result = shield.degrade_response(result, assessment)
                tool_responses.append(
                    genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=call.name,
                            response={"result": json.dumps(result, default=str)},
                        )
                    )
                )

        if not tool_responses:
            break
        response = chat.send_message(genai.protos.Content(parts=tool_responses))

    raw_text = getattr(response, "text", "") or ""
    structured = _parse_broker_response(raw_text)

    return {
        "reply": structured.get("reply", raw_text),
        "prepared_blocks": structured.get("prepared_blocks", []),
        "prepared_actions": structured.get("prepared_actions", []),
        "artifacts": structured.get("artifacts", []),
        "session_id": req.session_id,
        "threat_level": assessment.threat_level,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/v1/channels/configure")
async def configure_channel(req: ChannelConfigRequest):
    """
    Store channel credentials (called by the JIT connect sheet).
    Credentials are written to SQLite only — never to os.environ.
    """
    save_channel_config(req.user_id, req.channel, req.config)
    return {"status": "connected", "channel": req.channel}


@app.get("/v1/channels")
async def list_channels(user_id: str = "default"):
    """List connected channels for a user (config values not returned)."""
    return list_user_channels(user_id)


@app.post("/v1/tools/{tool_name}")
async def run_tool(tool_name: str, req: ToolRequest):
    """
    Direct tool execution.
    If the tool needs a channel that is not connected, returns:
      {requires_connection: true, resume_token, channel, prompt, fields}
    The frontend stores the token and opens the Connect Sheet.
    After the broker connects, the frontend calls /v1/actions/resume.
    """
    result = executor.execute(
        tool_name,
        req.args,
        session_id=req.session_id or "direct",
        user_id=req.user_id,
    )
    # Attach a resume token so the frontend can resume after connecting
    if result.get("requires_connection"):
        token = create_resume_token(
            user_id=req.user_id,
            session_id=req.session_id or "direct",
            tool_name=tool_name,
            args=req.args,
        )
        result["resume_token"] = token
    return result


@app.post("/v1/actions/resume")
async def resume_action(req: ResumeRequest):
    """
    Called by the frontend immediately after the broker connects a channel.
    Looks up the stored tool + args by token, re-executes the tool,
    and returns the result. Token is single-use and deleted on consumption.
    """
    pending = consume_resume_token(req.resume_token)
    if not pending:
        raise HTTPException(
            status_code=404,
            detail="resume_token not found or already used",
        )

    result = executor.execute(
        pending["tool_name"],
        pending["args"],
        session_id=pending["session_id"],
        user_id=pending["user_id"],
    )

    if result.get("requires_connection"):
        # Credentials were stored but still not passing preflight (e.g. wrong values)
        return {"status": "still_blocked", "detail": result}

    return {
        "status": "executed",
        "tool_name": pending["tool_name"],
        "result": result,
    }


# ── SUPPORTING ENDPOINTS ───────────────────────────────────────────────────

@app.get("/v1/profile/{session_id}")
async def get_profile(session_id: str):
    with engine.connect() as conn:
        res = conn.execute(
            text("SELECT * FROM investor_intent_profiles WHERE session_id = :sid"),
            {"sid": session_id},
        ).fetchone()
        return dict(res._mapping) if res else {"status": "new_user"}


@app.get("/v1/market/overview")
async def market_overview():
    with engine.connect() as conn:
        res = conn.execute(text("SELECT * FROM get_market_overview()")).fetchone()
        return dict(res._mapping)


@app.get("/v1/market/pulse")
async def market_pulse():
    """Returns live market pulse from the data spine."""
    try:
        return executor.execute("get_market_pulse", {}, session_id="system")
    except Exception:
        return {
            "regime": "TRANSITIONAL",
            "directive": "SELECTIVE_BUY",
            "market_efficiency_score": 65.0,
            "hypergrowth_areas": [],
            "top_cities": [],
            "timestamp": datetime.now().isoformat(),
        }


@app.post("/v1/outreach/trigger")
async def trigger_outreach(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_proactive_scan)
    return {"status": "scan_initiated"}


def _run_proactive_scan():
    """
    Scans for price-dropped properties and returns matching leads.
    Messages are NOT sent automatically — results are logged for
    the broker to review and act on from the console.
    """
    results = []
    with engine.connect() as conn:
        drops = conn.execute(
            text(
                "SELECT name, area, final_price_from FROM entrestate_inventory "
                "WHERE dld_price_delta_pct < -20 LIMIT 5"
            )
        ).fetchall()
        for drop in drops:
            matches = conn.execute(
                text(
                    "SELECT session_id FROM investor_intent_profiles "
                    "WHERE budget_max >= :price "
                    "AND (preferred_areas ILIKE :area OR preferred_areas IS NULL)"
                ),
                {"price": drop.final_price_from, "area": f"%{drop.area}%"},
            ).fetchall()
            for m in matches:
                results.append({
                    "property": drop.name,
                    "area": drop.area,
                    "price": drop.final_price_from,
                    "session_id": m.session_id,
                })
    return results


@app.websocket("/v1/chat/stream/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    Streaming chat over WebSocket.
    Collects the full LLM response, parses it through the same structured
    contract as /v1/chat, and sends the final JSON.
    """
    await websocket.accept()
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
        tools=executor.get_tool_definitions(),
    )
    chat_session = model.start_chat(history=[])
    try:
        while True:
            user_msg = await websocket.receive_text()
            response = chat_session.send_message(user_msg)

            # Tool-call loop (max 5 rounds, data tools only)
            for _ in range(5):
                if not response.candidates or not response.candidates[0].content.parts:
                    break
                has_func = any(
                    hasattr(p, "function_call") and p.function_call.name
                    for p in response.candidates[0].content.parts
                )
                if not has_func:
                    break

                tool_responses = []
                for part in response.candidates[0].content.parts:
                    if hasattr(part, "function_call") and part.function_call.name:
                        call = part.function_call
                        result = executor.execute(
                            call.name, dict(call.args), session_id, user_id="default"
                        )
                        tool_responses.append(
                            genai.protos.Part(
                                function_response=genai.protos.FunctionResponse(
                                    name=call.name,
                                    response={"result": json.dumps(result, default=str)},
                                )
                            )
                        )
                if not tool_responses:
                    break
                response = chat_session.send_message(
                    genai.protos.Content(parts=tool_responses)
                )

            raw_text = getattr(response, "text", "") or ""
            structured = _parse_broker_response(raw_text)

            await websocket.send_json({
                "type": "result",
                "reply": structured.get("reply", raw_text),
                "prepared_blocks": structured.get("prepared_blocks", []),
                "prepared_actions": structured.get("prepared_actions", []),
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
            })
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
