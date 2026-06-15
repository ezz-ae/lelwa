import { NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"

// Runs server-side only — the service-account credentials never reach the browser.
export const runtime = "nodejs"

// marketing-agency-24119 — Vertex AI Agent Engine (google-adk).
const PROJECT = process.env.VERTEX_PROJECT_ID || "610006155413"
const LOCATION = process.env.VERTEX_LOCATION || "us-central1"
const ENGINE_ID = process.env.VERTEX_REASONING_ENGINE_ID || "2989271399492747264"

// The field name the deployed agent expects inside `input`. Confirm in the Vertex
// Agent Engine "Test" tab — common values are "input" or "message". Override with
// VERTEX_INPUT_KEY if the call returns an argument error.
const INPUT_KEY = process.env.VERTEX_INPUT_KEY || "input"

function serviceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) return undefined // fall back to Application Default Credentials
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export async function POST(req: Request) {
  let question = ""
  try {
    const body = await req.json()
    question = String(body?.question ?? "").trim()
  } catch {
    /* ignore malformed body */
  }
  if (!question) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 })
  }

  try {
    const auth = new GoogleAuth({
      credentials: serviceAccountCredentials(),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
    const client = await auth.getClient()
    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/reasoningEngines/${ENGINE_ID}:query`

    // Adjust this shape to match your agent's signature if needed (see Test tab).
    const payload = { class_method: "query", input: { [INPUT_KEY]: question } }

    const res = await client.request<Record<string, unknown>>({ url, method: "POST", data: payload })
    const answer = extractText(res.data) ?? "The agent returned no answer."
    return NextResponse.json({ answer })
  } catch (err) {
    const message = err instanceof Error ? err.message : "The agent request failed."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

// Reasoning-engine responses vary by framework; pull the most likely text field.
function extractText(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === "string") return value
  if (typeof value === "object") {
    const v = value as Record<string, unknown>
    for (const key of ["output", "response", "text", "content", "answer", "result"]) {
      const found = extractText(v[key])
      if (found) return found
    }
  }
  return null
}
