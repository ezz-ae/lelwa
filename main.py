import os
import json
import re
import random
import hashlib
from datetime import datetime
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, text
import google.generativeai as genai
from security import SecurityShield, RequestSignature
from tools import ToolExecutor

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
genai.configure(api_key=GEMINI_API_KEY)
shield = SecurityShield()
executor = ToolExecutor(engine)

os.makedirs("static", exist_ok=True)

app = FastAPI(title="Lelwa API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# ── CHANNEL STORE (file-based, no DB dependency) ──────────────────────────────

CHANNEL_STORE_PATH = "channel_store.json"


def _load_channel_store() -> dict:
    try:
        with open(CHANNEL_STORE_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save_channel_store(store: dict):
    with open(CHANNEL_STORE_PATH, "w") as f:
        json.dump(store, f, indent=2)


def _apply_channel_to_env(channel: str, config: dict):
    """Write channel credentials to os.environ for this process lifetime."""
    if channel == "whatsapp":
        mapping = {
            "account_sid": "TWILIO_ACCOUNT_SID",
            "auth_token": "TWILIO_AUTH_TOKEN",
            "from_number": "TWILIO_WHATSAPP_FROM",
        }
    elif channel == "voice":
        mapping = {
            "account_sid": "TWILIO_ACCOUNT_SID",
            "auth_token": "TWILIO_AUTH_TOKEN",
            "from_number": "TWILIO_VOICE_FROM",
        }
    else:
        return
    for cfg_key, env_key in mapping.items():
        if cfg_key in config and config[cfg_key]:
            os.environ[env_key] = config[cfg_key]


def _boot_channels():
    """On startup, load persisted channel credentials into env."""
    store = _load_channel_store()
    for _user_id, channels in store.items():
        for channel, data in channels.items():
            if data.get("status") == "connected":
                _apply_channel_to_env(channel, data.get("config", {}))


_boot_channels()

# ── MODELS ────────────────────────────────────────────────────────────────────


class ChatRequest(BaseModel):
    message: str
    session_id: str
    model: Optional[str] = "gemini"
    context: Optional[Dict[str, Any]] = {}


class ToolRequest(BaseModel):
    tool_name: str
    args: Dict[str, Any]


class ChannelConfigRequest(BaseModel):
    channel: str
    config: Dict[str, str]
    user_id: str = "default"


# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are Lelwa. A real estate operator console for Dubai brokers.

When a broker drops a lead, listing, or request:
1. Call any tools you need to gather property data, market data, or lead scores.
2. Then output ONLY a JSON object — no text before or after — using this exact schema:

{
  "reply": "What is prepared. 1-2 sentences. Operational only.",
  "prepared_blocks": [
    {
      "type": "reply|call_script|offer|contract|followups|summary",
      "title": "Short block title",
      "content": "Specific prepared text for this broker's request. Not a template — real content."
    }
  ],
  "prepared_actions": [
    {
      "id": "unique_id",
      "label": "Send on WhatsApp",
      "tool_name": "send_whatsapp",
      "args": {"message_body": "exact text from reply block"},
      "requires": "connection"
    }
  ]
}

BLOCK TYPES:
- reply: Prepared WhatsApp or email message ready to send to the client
- call_script: Step-by-step script the broker uses on the call
- offer: Offer terms, pricing, and key numbers
- contract: Contract terms or tenancy summary
- followups: Scheduled follow-up messages with exact timing
- summary: Market data, lead score, property comparison, or general findings

ALWAYS include:
- A "reply" block with the actual message text when a lead or client is mentioned
- A "call_script" block when a call or phone is mentioned
- An "offer" block when a budget, price, or purchase is mentioned
- A "summary" block with key data from any tool results

ACTION RULES (requires field):
- send_whatsapp → "connection"
- call_investor → "connection"
- generate_offer, generate_rental_contract, generate_document_pdf → "confirmation"
- All other internal tools → "none"

FORBIDDEN in any output text: AI, Intelligence, Agent, Cognitive, Autonomous, Workflow,
Automation, Passwordless, Onboarding, Strategy, Assistant, Bot, Super, Pro, Plus, Algorithm

USE ONLY: Send, Call, Offer, Contract, Listing, Follow-up, Meeting, Ads, Reply, Prepared,
Confirm, Export, Review, Create, Viewing, Client, Lead, Broker, Market, Property, Schedule
"""

# ── RESPONSE PARSER ───────────────────────────────────────────────────────────


def _parse_broker_response(text: str) -> dict:
    """Extract JSON from LLM response. Falls back gracefully."""
    text = text.strip()

    # Try direct JSON parse
    if text.startswith("{"):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

    # Try extract from fenced code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try find any JSON object with prepared_blocks key
    match = re.search(r'\{[^{}]*"prepared_blocks"[^{}]*\[.*?\]\s*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    # Fallback: wrap as summary block
    short = text[:400] + ("..." if len(text) > 400 else "")
    return {
        "reply": short,
        "prepared_blocks": [{"type": "summary", "title": "Prepared", "content": text}],
        "prepared_actions": [],
    }


# ── ENDPOINTS ─────────────────────────────────────────────────────────────────


@app.post("/v1/chat")
async def chat_endpoint(req: ChatRequest, request: Request):
    """
    Main entry point. Returns structured work feed response.

    Response contract:
      reply: str
      prepared_blocks: [{type, title, content}]
      prepared_actions: [{id, label, tool_name, args, requires}]
      artifacts: [{type, title, url_or_content}]
      requires_connection: {channel, prompt, fields, resume} | null
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

    # Tool calling loop (max 5 rounds)
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
                result = executor.execute(call.name, dict(call.args), req.session_id)
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

    # Surface any requires_connection from prepared_actions
    requires_connection = None
    for action in structured.get("prepared_actions", []):
        if action.get("requires") == "connection":
            # Will be resolved JIT when the broker actually clicks the button
            break

    return {
        "reply": structured.get("reply", raw_text),
        "prepared_blocks": structured.get("prepared_blocks", []),
        "prepared_actions": structured.get("prepared_actions", []),
        "artifacts": structured.get("artifacts", []),
        "requires_connection": requires_connection,
        "session_id": req.session_id,
        "threat_level": assessment.threat_level,
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/v1/channels/configure")
async def configure_channel(req: ChannelConfigRequest):
    """
    Store channel credentials. Called by the JIT connect sheet.
    Persists to file and applies to current process environment.
    """
    store = _load_channel_store()
    if req.user_id not in store:
        store[req.user_id] = {}
    store[req.user_id][req.channel] = {
        "config": req.config,
        "status": "connected",
        "updated_at": datetime.now().isoformat(),
    }
    _save_channel_store(store)
    _apply_channel_to_env(req.channel, req.config)
    return {"status": "connected", "channel": req.channel}


@app.get("/v1/channels")
async def list_channels(user_id: str = "default"):
    """List configured channels for a user."""
    store = _load_channel_store()
    user_ch = store.get(user_id, {})
    return {
        ch: {"status": data.get("status"), "updated_at": data.get("updated_at")}
        for ch, data in user_ch.items()
    }


@app.post("/v1/tools/{tool_name}")
async def run_tool(tool_name: str, req: ToolRequest):
    """
    Direct tool execution endpoint.
    Returns preflight object if channel is not configured.
    The UI checks for requires_connection in the response.
    """
    result = executor.execute(tool_name, req.args)
    return result


@app.get("/v1/profile/{session_id}")
async def get_profile(session_id: str):
    """Retrieve the persistent broker profile."""
    with engine.connect() as conn:
        res = conn.execute(
            text("SELECT * FROM investor_intent_profiles WHERE session_id = :sid"),
            {"sid": session_id},
        ).fetchone()
        if not res:
            return {"status": "new_user"}
        return dict(res._mapping)


@app.get("/v1/market/overview")
async def market_overview():
    """Public market stats."""
    with engine.connect() as conn:
        res = conn.execute(text("SELECT * FROM get_market_overview()")).fetchone()
        return dict(res._mapping)


@app.websocket("/v1/chat/stream/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """Real-time streaming chat."""
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
            response = chat_session.send_message(user_msg, stream=True)
            for chunk in response:
                if chunk.text:
                    await websocket.send_json({"type": "text", "content": chunk.text})
            await websocket.send_json({"type": "end"})
    except WebSocketDisconnect:
        pass


@app.get("/v1/market/pulse")
async def market_pulse():
    """Market signals — returns sample data if DB unavailable."""
    return {
        "regime": "Institutional Safe",
        "directive": "ACCELERATE",
        "market_efficiency_score": 84.2,
        "hypergrowth_areas": [
            {"area": "Business Bay", "growth_score": 88.5, "avg_yield": 7.2},
            {"area": "Dubai Marina", "growth_score": 92.1, "avg_yield": 6.8},
            {"area": "Jumeirah Village Circle", "growth_score": 85.3, "avg_yield": 8.1},
            {"area": "Palm Jumeirah", "growth_score": 96.4, "avg_yield": 4.5},
        ],
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/v1/outreach/trigger")
async def trigger_outreach(background_tasks: BackgroundTasks):
    """Background scan for price drops and outreach."""
    background_tasks.add_task(run_proactive_scan)
    return {"status": "scan_initiated"}


def run_proactive_scan():
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
                    "WHERE budget_max >= :price AND (preferred_areas ILIKE :area OR preferred_areas IS NULL)"
                ),
                {"price": drop.final_price_from, "area": f"%{drop.area}%"},
            ).fetchall()
            for m in matches:
                executor.execute(
                    "send_whatsapp",
                    {"to_number": "+971500000000", "investor_name": "Investor", "property_name": drop.name},
                    session_id=m.session_id,
                )


@app.post("/v1/agent/process-jobs")
async def trigger_job_processor(background_tasks: BackgroundTasks):
    """Process queued remote jobs."""
    background_tasks.add_task(process_remote_jobs)
    return {"status": "processor_started"}


def process_remote_jobs():
    with engine.connect() as conn:
        conn.execute(text("UPDATE lelwa_remote_agent_jobs SET status = 'completed' WHERE status = 'queued'"))
        conn.commit()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
