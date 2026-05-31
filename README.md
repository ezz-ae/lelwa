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
| Console frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui |
| Marketing frontend | Next.js 15 · React 19 · Tailwind CSS |
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
└── marketing/
    ├── app/page.tsx           Public marketing site
    ├── lib/console-url.ts     Console URL helper for cross-app links
    └── next.config.mjs        Redirects console routes when deployed separately
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

### 4. Marketing site

```bash
cd marketing
npm install
npm run dev
# → http://localhost:3001
```

Set one of these when the marketing app is deployed separately from the console:

```
LELWA_CONSOLE_URL=https://console.your-domain.com
NEXT_PUBLIC_CONSOLE_URL=https://console.your-domain.com
```

## Verification

Run the full local verification pass from the repository root:

```bash
npm run verify
```

This compiles the backend Python modules, builds the console app, builds the marketing app, and checks production npm audit results for both frontend packages.

Current known limitation: `next.config.mjs` skips TypeScript build blocking while the workflow editor and legacy marketing component types are cleaned up. Treat `npm run verify` as the deployment gate for now, and run `npx tsc --noEmit` in each app when working specifically on type cleanup.

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

## Deployment

This repo holds three deployable pieces: the **frontend** console (`frontend/`, Next.js),
the **marketing** site (`marketing/`, Next.js), and the **backend** API (`main.py`, FastAPI).

### Frontend → Vercel (no dashboard config needed)
The root `vercel.json` tells Vercel to build only the `frontend/` Next.js app via the
`@vercel/next` builder, so a root import deploys the console directly (validated locally
with `vercel build`). Set these environment variables in the Vercel project:

- `NEXT_PUBLIC_API_BASE_URL` — public URL of the backend API (e.g. `https://lelwa-api.onrender.com`)
- `LELWA_API_BASE_URL` — same backend URL (used by server-side route handlers)

### Backend → Render / Railway / Fly / any Docker host
- **Render:** import the repo as a Blueprint (`render.yaml`), then set the secret env vars.
- **Docker:** `docker build -t lelwa-api . && docker run -p 8000:8000 --env-file .env lelwa-api`
- **Procfile hosts (Railway, etc.):** `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

Backend env vars (see `.env.example`): `DATABASE_URL`, `GEMINI_API_KEY`, `OPENAI_API_KEY`,
and the optional `TWILIO_*` values for WhatsApp/voice.

### Local development
```bash
# Backend (http://localhost:8000)
uvicorn main:app --reload

# Frontend console (http://localhost:3000)
npm run dev:frontend

# Marketing site (http://localhost:3001)
npm run dev:marketing
```
