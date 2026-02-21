# Lelwa — Broker Console

Lelwa is a real estate broker console for Dubai. Drop a lead, listing, or request — Lelwa prepares the reply, call script, and offer. One button to send.

---

## What it does

- **Work feed** — Every request produces typed work cards (reply, call script, offer, contract, follow-ups, summary), not a chatbot
- **One-click actions** — Send on WhatsApp, place a call, export a PDF, create a contract — each prepared first, executed on demand
- **JIT Connect** — No settings page. Credentials are asked once, at the moment of use, then stored locally
- **Prepared first** — Work is prepared even before channels are connected. Connect when you press Send

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui |
| Backend | FastAPI · Python 3.10+ · Gemini 2.0 Flash |
| Database | PostgreSQL via Neon (SQLAlchemy) |
| Messaging | Twilio (WhatsApp + Voice) — optional |
| PDF | FPDF |

---

## Project structure

```
/
├── main.py                    FastAPI app, /v1/chat, /v1/tools, /v1/channels
├── tools.py                   18+ real estate tools (search, mortgage, WhatsApp, voice…)
├── security.py                Rate limiting and threat scoring
├── schema.sql                 PostgreSQL schema (tables + functions)
├── entrestate_codex_spec_v1.json  Gemini function definitions
├── channel_store.json         [auto-created] persisted channel credentials — never committed
├── .env.example               Required environment variables
└── frontend/
    ├── app/
    │   ├── page.tsx           Landing — action tiles, links to console
    │   ├── login/             Log in page
    │   ├── activate/          First-run setup (role + actions selection)
    │   ├── loading.tsx        Global loading state
    │   └── (intel)/           Authenticated console (sidebar layout)
    │       ├── layout.tsx
    │       ├── studio/        Main work feed console
    │       ├── briefing/      Results overview
    │       └── connect/       Channel connection (WhatsApp, Voice, more)
    ├── components/
    │   ├── sidebar.tsx
    │   ├── account-menu.tsx
    │   ├── connect-sheet.tsx  JIT connect modal
    │   ├── upgrade-modal.tsx
    │   └── widget-cards.tsx
    └── lib/
        └── lelwa-actions.ts   Action theme system (colors, icons, chips)
```

---

## Getting started

### 1. Database

```bash
psql -d "$DATABASE_URL" -f schema.sql
```

### 2. Backend

```bash
cp .env.example .env
# fill in DATABASE_URL, GEMINI_API_KEY
# Twilio vars are optional — enter them in the UI when you first press Send/Call

pip install -r requirements.txt
python3 main.py
# → http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

The frontend defaults to `http://localhost:8000` for the API. Override with:

```
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `TWILIO_ACCOUNT_SID` | ⬜ | Twilio account SID (set via UI) |
| `TWILIO_AUTH_TOKEN` | ⬜ | Twilio auth token (set via UI) |
| `TWILIO_WHATSAPP_FROM` | ⬜ | WhatsApp sender e.g. `whatsapp:+14155238886` |
| `TWILIO_VOICE_FROM` | ⬜ | Voice caller number e.g. `+14155238886` |

Twilio credentials can be entered through the console's JIT Connect sheet — they're stored in `channel_store.json` (gitignored) and applied to the environment on startup.

---

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/chat` | Send a message; returns `prepared_blocks`, `prepared_actions` |
| `POST` | `/v1/tools/{name}` | Execute a prepared action |
| `POST` | `/v1/channels/configure` | Store channel credentials |
| `GET` | `/v1/channels` | List connected channels for a user |

### `/v1/chat` response shape

```json
{
  "reply": "What is prepared. 1-2 sentences.",
  "prepared_blocks": [
    { "type": "reply|call_script|offer|contract|followups|summary", "title": "…", "content": "…" }
  ],
  "prepared_actions": [
    { "id": "…", "label": "Send on WhatsApp", "tool_name": "send_whatsapp", "args": {}, "requires": "connection|confirmation|none" }
  ],
  "artifacts": [],
  "requires_connection": false,
  "session_id": "…",
  "threat_level": "clear",
  "timestamp": "…"
}
```

---

## Vocabulary

Words that never appear in the UI:

> AI · Intelligence · Agent · Cognitive · Autonomous · Workflow · Automation · Passwordless · Onboarding · Strategy · Assistant · Bot · Super · Pro · Plus · Learn how · We generate

Words that do appear:

> Send · Call · Offer · Contract · Listing · Follow-up · Meeting · Ads · Review · Prepared · Confirmation required
