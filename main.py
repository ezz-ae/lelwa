import json
import re
import hashlib
import uuid
import tempfile
from datetime import datetime
from typing import Optional, Dict, Any

from dotenv import load_dotenv
import os

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
import google.generativeai as genai
from openai import OpenAI as _OpenAI

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
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


def _init_engine():
    if not DATABASE_URL:
        return None
    try:
        return create_engine(DATABASE_URL, pool_pre_ping=True)
    except Exception:
        return None


def _resolve_static_dir() -> str:
    configured = os.getenv("STATIC_DIR")
    if configured:
        return configured
    if os.getenv("VERCEL") == "1":
        return os.path.join(tempfile.gettempdir(), "lelwa-static")
    return os.path.join(os.path.dirname(__file__), "static")


engine = _init_engine()
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
ollama_client = _OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")
shield = SecurityShield()
executor = ToolExecutor(engine)
MANUAL_TOOL_NAMES = {"send_whatsapp", "call_investor"}

STATIC_DIR = _resolve_static_dir()
try:
    os.makedirs(STATIC_DIR, exist_ok=True)
except Exception:
    STATIC_DIR = os.path.join(tempfile.gettempdir(), "lelwa-static")
    os.makedirs(STATIC_DIR, exist_ok=True)

app = FastAPI(title="Lelwa API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    app.mount("/static", StaticFiles(directory=STATIC_DIR, check_dir=False), name="static")
except Exception:
    pass


def init_workflow_tables() -> None:
    """
    Creates workflow tables if missing.
    Fail-open so API can still boot even if DB migrations are unavailable.
    """
    if engine is None:
        return
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_definitions (
                    id          TEXT PRIMARY KEY,
                    user_id     TEXT NOT NULL DEFAULT 'default',
                    name        TEXT NOT NULL,
                    description TEXT,
                    template_id TEXT,
                    nodes_json  JSONB NOT NULL,
                    edges_json  JSONB NOT NULL,
                    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_definitions_user_updated
                ON workflow_definitions (user_id, updated_at DESC)
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_runs (
                    id           TEXT PRIMARY KEY,
                    workflow_id  TEXT NOT NULL,
                    user_id      TEXT NOT NULL DEFAULT 'default',
                    status       TEXT NOT NULL,
                    final_output TEXT,
                    started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    completed_at TIMESTAMPTZ,
                    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_started
                ON workflow_runs (workflow_id, started_at DESC)
            """))
    except Exception:
        # Do not block API startup if DB setup is unavailable.
        pass


init_workflow_tables()


# ── MODELS ─────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: str = "default"
    model: Optional[str] = "gemini"
    context: Dict[str, Any] = Field(default_factory=dict)


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


class WorkflowSaveRequest(BaseModel):
    id: Optional[str] = None
    user_id: str = "default"
    name: str
    description: Optional[str] = None
    template_id: Optional[str] = None
    nodes: list = Field(default_factory=list)
    edges: list = Field(default_factory=list)


class WorkflowRunLogRequest(BaseModel):
    user_id: str = "default"
    status: str
    final_output: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


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

    # 4. Regex: pull "reply" value even from malformed / truncated JSON
    m = re.search(r'"reply"\s*:\s*"((?:[^"\\]|\\.)*)"', text)
    if m:
        reply_val = m.group(1).encode().decode("unicode_escape", errors="replace")
        if reply_val.strip():
            return {"reply": reply_val.strip(), "prepared_blocks": [], "prepared_actions": []}

    # 5. Last resort: use raw text (truncated) only if it doesn't look like JSON
    short = text[:400] + ("…" if len(text) > 400 else "")
    if short.strip().startswith("{"):
        short = "Prepared reply ready."
    return {
        "reply": short,
        "prepared_blocks": [{"type": "summary", "title": "Prepared", "content": text}],
        "prepared_actions": [],
    }


def _ensure_prepared_contract(structured: dict, message: str) -> dict:
    """Guarantee reply + call_script blocks and basic actions exist."""
    reply_text = structured.get("reply")
    if not isinstance(reply_text, str):
        reply_text = ""
    reply_text = reply_text.strip()

    # If reply_text looks like JSON (tool-call / format bleed-through from Ollama),
    # unwrap the inner "reply" value using JSON parse first, then regex fallback.
    for _ in range(3):
        if not reply_text.startswith("{"):
            break
        extracted = None
        try:
            inner = json.loads(reply_text)
            inner_reply = inner.get("reply", "")
            if isinstance(inner_reply, str) and inner_reply.strip():
                extracted = inner_reply.strip()
                if not structured.get("prepared_blocks") and isinstance(inner.get("prepared_blocks"), list):
                    structured["prepared_blocks"] = inner["prepared_blocks"]
        except json.JSONDecodeError:
            # JSON may be truncated — use regex to pull out "reply": "..." value
            m = re.search(r'"reply"\s*:\s*"((?:[^"\\]|\\.)*)"', reply_text)
            if m:
                extracted = m.group(1).encode().decode("unicode_escape", errors="replace")
        if extracted and extracted.strip() and not extracted.strip().startswith("{"):
            reply_text = extracted.strip()
        else:
            break

    blocks = structured.get("prepared_blocks")
    if not isinstance(blocks, list):
        blocks = []

    actions = structured.get("prepared_actions")
    if not isinstance(actions, list):
        actions = []

    def has_block(block_type: str) -> bool:
        return any(isinstance(b, dict) and b.get("type") == block_type for b in blocks)

    def has_action(tool_name: str) -> bool:
        return any(isinstance(a, dict) and a.get("tool_name") == tool_name for a in actions)

    if not reply_text:
        reply_text = "Prepared reply ready."

    if not has_block("reply"):
        blocks.insert(0, {"type": "reply", "title": "Reply", "content": reply_text})

    if not has_block("call_script"):
        call_content = "Call the lead, confirm the request, budget, and next step."
        blocks.append({"type": "call_script", "title": "Call script", "content": call_content})
    else:
        call_content = next(
            (b.get("content", "") for b in blocks if isinstance(b, dict) and b.get("type") == "call_script"),
            "",
        )

    if not has_action("send_whatsapp"):
        seed = reply_text or message or "reply"
        actions.append({
            "id": f"send_whatsapp_{hashlib.md5(seed.encode()).hexdigest()[:8]}",
            "label": "Send WhatsApp",
            "tool_name": "send_whatsapp",
            "args": {"to_number": "", "message_body": reply_text},
            "requires": "connection",
        })

    if not has_action("call_investor"):
        seed = call_content or reply_text or message or "call"
        actions.append({
            "id": f"call_investor_{hashlib.md5(seed.encode()).hexdigest()[:8]}",
            "label": "Call lead",
            "tool_name": "call_investor",
            "args": {"to_number": "", "message": call_content},
            "requires": "connection",
        })

    structured["reply"] = reply_text
    structured["prepared_blocks"] = blocks
    structured["prepared_actions"] = actions
    return structured


# ── OLLAMA CHAT ────────────────────────────────────────────────────────────

def _chat_with_ollama(message: str, session_id: str, user_id: str, assessment, model: str | None = None) -> str:
    """
    Full tool-call loop against the local Ollama instance.
    Uses Ollama's OpenAI-compatible API at OLLAMA_BASE_URL.
    `model` overrides the OLLAMA_MODEL env default for this request.
    Returns the final raw text response from the model.
    """
    ollama_model = model or OLLAMA_MODEL
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": message},
    ]
    openai_tools = executor.get_openai_tool_definitions()
    last_content = ""

    for _ in range(5):
        response = ollama_client.chat.completions.create(
            model=ollama_model,
            messages=messages,
            tools=openai_tools,
            tool_choice="auto",
        )
        choice = response.choices[0]
        last_content = choice.message.content or ""

        if not choice.message.tool_calls:
            break

        # Append assistant turn with tool calls
        tool_calls_serialized = [
            {
                "id": tc.id,
                "type": "function",
                "function": {"name": tc.function.name, "arguments": tc.function.arguments},
            }
            for tc in choice.message.tool_calls
        ]
        messages.append({
            "role": "assistant",
            "content": last_content,
            "tool_calls": tool_calls_serialized,
        })

        # Execute each tool call and append results
        for tc in choice.message.tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            if tc.function.name in MANUAL_TOOL_NAMES:
                result = {"status": "manual_action_required"}
            else:
                result = executor.execute(tc.function.name, args, session_id, user_id=user_id)
            if assessment.threat_level != "clear":
                result = shield.degrade_response(result, assessment)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result, default=str),
            })

    return last_content


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
    try:
        # Route: anything that's not "gemini" (or empty) goes to local Ollama.
        # Pass the requested model name through so the canvas can pick llama3.2 vs deepseek-r1.
        _GEMINI_IDS = {"gemini", "gemini-2.0-flash", None, ""}
        if req.model not in _GEMINI_IDS:
            # "ollama" / "local" → env default; named models pass through literally
            ollama_model_override = req.model if req.model not in ("ollama", "local") else None
            raw_text = _chat_with_ollama(req.message, req.session_id, req.user_id, assessment, ollama_model_override)
        else:
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
                        if call.name in MANUAL_TOOL_NAMES:
                            result = {"status": "manual_action_required"}
                        else:
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

        structured = _ensure_prepared_contract(
            _parse_broker_response(raw_text),
            req.message,
        )
        return {
            "reply": structured.get("reply", raw_text),
            "prepared_blocks": structured.get("prepared_blocks", []),
            "prepared_actions": structured.get("prepared_actions", []),
            "artifacts": structured.get("artifacts", []),
            "session_id": req.session_id,
            "threat_level": assessment.threat_level,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception:
        # Keep studio flow alive even when model or data providers are unavailable.
        fallback = _ensure_prepared_contract(
            _parse_broker_response("Prepared reply ready."),
            req.message,
        )
        return {
            "reply": fallback.get("reply", "Prepared reply ready."),
            "prepared_blocks": fallback.get("prepared_blocks", []),
            "prepared_actions": fallback.get("prepared_actions", []),
            "artifacts": [],
            "session_id": req.session_id,
            "threat_level": assessment.threat_level,
            "degraded": True,
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


def _json_value(value, default):
    if value is None:
        return default
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return default
    return value


def _workflow_row_to_dict(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "user_id": row.get("user_id"),
        "name": row.get("name"),
        "description": row.get("description"),
        "template_id": row.get("template_id"),
        "nodes": _json_value(row.get("nodes_json"), []),
        "edges": _json_value(row.get("edges_json"), []),
        "created_at": row.get("created_at").isoformat() if row.get("created_at") else None,
        "updated_at": row.get("updated_at").isoformat() if row.get("updated_at") else None,
    }


def _workflow_storage_error() -> HTTPException:
    return HTTPException(status_code=503, detail="workflow storage unavailable")


@app.get("/v1/workflows")
async def list_workflows(user_id: str = "default"):
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, user_id, name, description, template_id, nodes_json, edges_json, created_at, updated_at
                    FROM workflow_definitions
                    WHERE user_id = :user_id
                    ORDER BY updated_at DESC
                """),
                {"user_id": user_id},
            ).fetchall()
            return {"workflows": [_workflow_row_to_dict(dict(r._mapping)) for r in rows]}
    except Exception:
        return {"workflows": []}


@app.post("/v1/workflows")
async def create_workflow(req: WorkflowSaveRequest):
    workflow_id = req.id or str(uuid.uuid4())
    if engine is None:
        raise _workflow_storage_error()
    try:
        with engine.begin() as conn:
            row = conn.execute(
                text("""
                    INSERT INTO workflow_definitions
                        (id, user_id, name, description, template_id, nodes_json, edges_json, created_at, updated_at)
                    VALUES
                        (:id, :user_id, :name, :description, :template_id, CAST(:nodes_json AS JSONB), CAST(:edges_json AS JSONB), NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        user_id = EXCLUDED.user_id,
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        template_id = EXCLUDED.template_id,
                        nodes_json = EXCLUDED.nodes_json,
                        edges_json = EXCLUDED.edges_json,
                        updated_at = NOW()
                    RETURNING id, user_id, name, description, template_id, nodes_json, edges_json, created_at, updated_at
                """),
                {
                    "id": workflow_id,
                    "user_id": req.user_id,
                    "name": req.name,
                    "description": req.description,
                    "template_id": req.template_id,
                    "nodes_json": json.dumps(req.nodes or []),
                    "edges_json": json.dumps(req.edges or []),
                },
            ).fetchone()
            if not row:
                raise HTTPException(status_code=500, detail="workflow not saved")
            return {"workflow": _workflow_row_to_dict(dict(row._mapping))}
    except HTTPException:
        raise
    except Exception:
        raise _workflow_storage_error()


@app.get("/v1/workflows/{workflow_id}")
async def get_workflow(workflow_id: str, user_id: str = "default"):
    if engine is None:
        raise _workflow_storage_error()
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text("""
                    SELECT id, user_id, name, description, template_id, nodes_json, edges_json, created_at, updated_at
                    FROM workflow_definitions
                    WHERE id = :id AND user_id = :user_id
                """),
                {"id": workflow_id, "user_id": user_id},
            ).fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Workflow not found")
            return {"workflow": _workflow_row_to_dict(dict(row._mapping))}
    except HTTPException:
        raise
    except Exception:
        raise _workflow_storage_error()


@app.put("/v1/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, req: WorkflowSaveRequest):
    payload = req.model_copy(update={"id": workflow_id})
    return await create_workflow(payload)


@app.delete("/v1/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, user_id: str = "default"):
    if engine is None:
        raise _workflow_storage_error()
    try:
        with engine.begin() as conn:
            conn.execute(
                text("DELETE FROM workflow_runs WHERE workflow_id = :id AND user_id = :user_id"),
                {"id": workflow_id, "user_id": user_id},
            )
            result = conn.execute(
                text("DELETE FROM workflow_definitions WHERE id = :id AND user_id = :user_id"),
                {"id": workflow_id, "user_id": user_id},
            )
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Workflow not found")
    except HTTPException:
        raise
    except Exception:
        raise _workflow_storage_error()
    return {"success": True}


@app.get("/v1/workflows/{workflow_id}/history")
async def get_workflow_history(workflow_id: str, user_id: str = "default"):
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, workflow_id, status, final_output, started_at, completed_at
                    FROM workflow_runs
                    WHERE workflow_id = :workflow_id AND user_id = :user_id
                    ORDER BY started_at DESC
                    LIMIT 50
                """),
                {"workflow_id": workflow_id, "user_id": user_id},
            ).fetchall()
            history = [
                {
                    "id": r.id,
                    "workflow_id": r.workflow_id,
                    "status": r.status,
                    "final_output": r.final_output,
                    "started_at": r.started_at.isoformat() if r.started_at else None,
                    "completed_at": r.completed_at.isoformat() if r.completed_at else None,
                }
                for r in rows
            ]
            return {"history": history}
    except Exception:
        return {"history": []}


@app.post("/v1/workflows/{workflow_id}/history")
async def log_workflow_history(workflow_id: str, req: WorkflowRunLogRequest):
    run_id = str(uuid.uuid4())
    started_at = req.started_at or datetime.now().isoformat()
    try:
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO workflow_runs
                        (id, workflow_id, user_id, status, final_output, started_at, completed_at, created_at)
                    VALUES
                        (:id, :workflow_id, :user_id, :status, :final_output, CAST(:started_at AS TIMESTAMPTZ), CAST(:completed_at AS TIMESTAMPTZ), NOW())
                """),
                {
                    "id": run_id,
                    "workflow_id": workflow_id,
                    "user_id": req.user_id,
                    "status": req.status,
                    "final_output": req.final_output,
                    "started_at": started_at,
                    "completed_at": req.completed_at,
                },
            )
            return {"success": True, "id": run_id}
    except Exception:
        return {"success": False}


# ── SUPPORTING ENDPOINTS ───────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/v1/profile/{session_id}")
async def get_profile(session_id: str):
    try:
        with engine.connect() as conn:
            res = conn.execute(
                text("SELECT * FROM investor_intent_profiles WHERE session_id = :sid"),
                {"sid": session_id},
            ).fetchone()
            return dict(res._mapping) if res else {"status": "new_user"}
    except Exception:
        return {"status": "new_user"}


@app.get("/v1/market/overview")
async def market_overview():
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT * FROM get_market_overview()")).fetchone()
            if not res:
                raise ValueError("overview query returned no rows")
            return dict(res._mapping)
    except Exception:
        return {
            "regime": "TRANSITIONAL",
            "directive": "SELECTIVE_BUY",
            "market_efficiency_score": 65.0,
            "areas_tracked": 0,
            "timestamp": datetime.now().isoformat(),
        }


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
    if engine is None:
        return results
    try:
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
    except Exception:
        return []
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
                        if call.name in MANUAL_TOOL_NAMES:
                            result = {"status": "manual_action_required"}
                        else:
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
            structured = _ensure_prepared_contract(
                _parse_broker_response(raw_text),
                user_msg,
            )

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
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
