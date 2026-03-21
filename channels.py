"""
Channel credential store — SQLite, per-user, per-request.

Rules enforced here:
  - Credentials are NEVER written to os.environ
  - Credentials are fetched per-request and passed directly to the caller
  - Tokens are single-use and deleted on consumption
"""

import json
import os
import sqlite3
import tempfile
import uuid
from datetime import datetime
from typing import Optional


def _resolve_channel_db_path() -> str:
    env_path = os.getenv("CHANNEL_DB_PATH") or os.getenv("CHANNEL_DB")
    if env_path:
        return env_path

    # Serverless file systems are read-only except /tmp.
    if os.getenv("VERCEL") == "1":
        return os.path.join(tempfile.gettempdir(), "channels.db")

    return os.path.join(os.path.dirname(__file__), "channels.db")


def _ensure_writable_db_path(path: str) -> str:
    try:
        parent = os.path.dirname(path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with sqlite3.connect(path):
            pass
        return path
    except Exception:
        fallback = os.path.join(tempfile.gettempdir(), "channels.db")
        os.makedirs(os.path.dirname(fallback), exist_ok=True)
        with sqlite3.connect(fallback):
            pass
        return fallback


CHANNEL_DB = _ensure_writable_db_path(_resolve_channel_db_path())


def _connect() -> sqlite3.Connection:
    return sqlite3.connect(CHANNEL_DB)


# ── Initialisation ─────────────────────────────────────────────────────────

def init_channel_db() -> None:
    with _connect() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS user_channels (
                user_id     TEXT NOT NULL,
                channel     TEXT NOT NULL,
                status      TEXT NOT NULL DEFAULT 'connected',
                config_json TEXT NOT NULL,
                updated_at  TEXT NOT NULL,
                PRIMARY KEY (user_id, channel)
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS resume_tokens (
                token      TEXT PRIMARY KEY,
                user_id    TEXT NOT NULL,
                session_id TEXT NOT NULL,
                tool_name  TEXT NOT NULL,
                args_json  TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


# ── Channel CRUD ───────────────────────────────────────────────────────────

def get_channel_config(user_id: str, channel: str) -> Optional[dict]:
    """
    Return live credentials for (user_id, channel).
    Returns None if the channel is not connected.
    Never reads or writes os.environ.
    """
    with _connect() as db:
        row = db.execute(
            "SELECT config_json FROM user_channels "
            "WHERE user_id=? AND channel=? AND status='connected'",
            (user_id, channel),
        ).fetchone()
    return json.loads(row[0]) if row else None


def save_channel_config(user_id: str, channel: str, config: dict) -> None:
    with _connect() as db:
        db.execute(
            """
            INSERT INTO user_channels (user_id, channel, status, config_json, updated_at)
            VALUES (?, ?, 'connected', ?, ?)
            ON CONFLICT (user_id, channel) DO UPDATE SET
                config_json = excluded.config_json,
                status      = 'connected',
                updated_at  = excluded.updated_at
            """,
            (user_id, channel, json.dumps(config), datetime.now().isoformat()),
        )


def list_user_channels(user_id: str) -> dict:
    with _connect() as db:
        rows = db.execute(
            "SELECT channel, status, updated_at FROM user_channels WHERE user_id=?",
            (user_id,),
        ).fetchall()
    return {row[0]: {"status": row[1], "updated_at": row[2]} for row in rows}


# ── Resume tokens ──────────────────────────────────────────────────────────

def create_resume_token(
    user_id: str, session_id: str, tool_name: str, args: dict
) -> str:
    """
    Store a pending tool execution. Returns an opaque UUID token.
    The token is included in the requires_connection response so the
    frontend can resume after the broker connects the channel.
    """
    token = str(uuid.uuid4())
    with _connect() as db:
        db.execute(
            """
            INSERT INTO resume_tokens
                (token, user_id, session_id, tool_name, args_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                token,
                user_id,
                session_id,
                tool_name,
                json.dumps(args),
                datetime.now().isoformat(),
            ),
        )
    return token


def consume_resume_token(token: str) -> Optional[dict]:
    """
    Fetch and atomically delete a resume token.
    Tokens expire after 24 hours.
    Returns None if the token does not exist, has expired, or was already used.
    """
    from datetime import timedelta
    cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
    with _connect() as db:
        # Purge stale tokens (older than 24h) on every consume
        db.execute("DELETE FROM resume_tokens WHERE created_at < ?", (cutoff,))
        row = db.execute(
            "SELECT user_id, session_id, tool_name, args_json "
            "FROM resume_tokens WHERE token=? AND created_at >= ?",
            (token, cutoff),
        ).fetchone()
        if not row:
            return None
        db.execute("DELETE FROM resume_tokens WHERE token=?", (token,))
    return {
        "user_id": row[0],
        "session_id": row[1],
        "tool_name": row[2],
        "args": json.loads(row[3]),
    }


# Initialise tables on import
try:
    init_channel_db()
except Exception:
    # Keep API importable; channel-backed actions will fail at call-time if storage is unavailable.
    pass
