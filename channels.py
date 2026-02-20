"""
Channel credential store — SQLite, per-user, per-request.

Rules enforced here:
  - Credentials are NEVER written to os.environ
  - Credentials are fetched per-request and passed directly to the caller
  - Tokens are single-use and deleted on consumption
"""

import json
import sqlite3
import uuid
from datetime import datetime
from typing import Optional

CHANNEL_DB = "channels.db"


# ── Initialisation ─────────────────────────────────────────────────────────

def init_channel_db() -> None:
    with sqlite3.connect(CHANNEL_DB) as db:
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
    with sqlite3.connect(CHANNEL_DB) as db:
        row = db.execute(
            "SELECT config_json FROM user_channels "
            "WHERE user_id=? AND channel=? AND status='connected'",
            (user_id, channel),
        ).fetchone()
    return json.loads(row[0]) if row else None


def save_channel_config(user_id: str, channel: str, config: dict) -> None:
    with sqlite3.connect(CHANNEL_DB) as db:
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
    with sqlite3.connect(CHANNEL_DB) as db:
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
    with sqlite3.connect(CHANNEL_DB) as db:
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
    Returns None if the token does not exist (expired or already used).
    """
    with sqlite3.connect(CHANNEL_DB) as db:
        row = db.execute(
            "SELECT user_id, session_id, tool_name, args_json "
            "FROM resume_tokens WHERE token=?",
            (token,),
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
init_channel_db()
