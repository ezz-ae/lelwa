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
| Console frontend | Next.js 15.5 · React 19 · TypeScript · Tailwind CSS · shadcn/ui |
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
├── entrestate_codex_spec_v1.json  Entrestate codex spec — tools, scoring, routing, data model (loaded at runtime)
├── channels.db                [auto-created] SQLite channel-credential store — gitignored, never committed
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

Twilio credentials can be entered through the console's JIT Connect sheet — they're stored in `channels.db` (a gitignored SQLite store, never committed) and loaded at runtime when an action is sent.

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

Three independently deployable pieces, two targets:

| Piece | Target | How |
|---|---|---|
| `frontend/` console | Vercel project (Root Directory = `frontend`) | Next.js, zero-config |
| `marketing/` site | Separate Vercel project (Root Directory = `marketing`) | Next.js, zero-config |
| backend (`main.py`) | Render (or any Docker host) | `render.yaml` blueprint |

> There is **no** `vercel.json`, and there should not be one. A legacy
> `builds`-based `vercel.json` is exactly what previously broke the deploy.
> Both Next apps deploy zero-config from their own subdirectory.

### Frontend console → Vercel

In the Vercel project's **Settings → Build & Development Settings**:

- **Root Directory:** `frontend`
- **Framework Preset:** Next.js
- Leave **Install / Build / Output** commands **blank** (zero-config). The blank
  install works because `frontend/.npmrc` ships `legacy-peer-deps=true`, required
  for the React 19 + Radix peer ranges — **keep that file**.

Set these for **both Production and Preview** _before_ redeploying
(`NEXT_PUBLIC_*` is inlined at build time, so it must exist before the build):

- `NEXT_PUBLIC_API_BASE_URL` — backend URL, e.g. `https://lelwa-api.onrender.com` (no trailing slash)
- `LELWA_API_BASE_URL` — same backend URL (read by the `app/api/**` route handlers)

> If the linked Vercel project shows **Framework = "fastapi"**, that is the bug —
> set Root Directory + Framework as above. The backend does **not** run on Vercel.

### Marketing site → Vercel (separate project)

A second Vercel project importing the same repo, **Root Directory = `marketing`**,
Framework Preset = Next.js. Set both (Production + Preview) to the console URL:

- `NEXT_PUBLIC_CONSOLE_URL` — used by the client-side CTA link (required)
- `LELWA_CONSOLE_URL` — used by the server-side route redirects

### Backend → Render (canonical) or any Docker host

- **Render (canonical):** New → Blueprint → pick this repo (`render.yaml`). It sets
  `uvicorn main:app`, health check `/health`, Python 3.12. Fill the `sync: false`
  secrets in the dashboard after first deploy.
- **Docker (alt — Railway / Fly / etc.):**
  `docker build -t lelwa-api . && docker run -p 8000:8000 --env-file .env lelwa-api`
  (`Dockerfile` and `Procfile` both honor `$PORT`.)

Backend env vars: `DATABASE_URL` and `GEMINI_API_KEY` are required for real
functionality — the app boots and `/health` responds without them, but data and
chat fall back to stubs. `TWILIO_*` are optional and can also be entered per-user
via the console's JIT Connect sheet.

> **Render free tier:** no persistent disk, so `channels.db` (the SQLite credential
> store) resets on each deploy/restart — brokers re-connect channels via the JIT
> sheet. The service also spins down when idle; the first request after wake is slow.

### Local development
```bash
# Backend (http://localhost:8000)
uvicorn main:app --reload

# Frontend console (http://localhost:3000)
npm run dev:frontend

# Marketing site (http://localhost:3001)
npm run dev:marketing
```
