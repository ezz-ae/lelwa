import { GoogleAuth } from "google-auth-library"

// Shared client for the Vertex AI Agent Engine agent (marketing-agency-24119).
// Server-only — never import from a client component.

const PROJECT = process.env.VERTEX_PROJECT_ID || "610006155413"
const LOCATION = process.env.VERTEX_LOCATION || "us-central1"
const ENGINE_ID = process.env.VERTEX_REASONING_ENGINE_ID || "2989271399492747264"
// The field the deployed agent expects inside `input` ("input" or "message").
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

/** Query the agent. Throws (with the upstream Vertex error attached) on failure. */
export async function askAgent(question: string): Promise<string> {
  const auth = new GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  })
  const client = await auth.getClient()
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/reasoningEngines/${ENGINE_ID}:query`
  const payload = { class_method: "query", input: { [INPUT_KEY]: question } }
  const res = await client.request<Record<string, unknown>>({ url, method: "POST", data: payload })
  return extractText(res.data) ?? "The agent returned no answer."
}

/** Turn an unknown Vertex error into a readable string (includes upstream detail). */
export function agentErrorMessage(err: unknown): string {
  const e = err as { message?: string; response?: { data?: unknown } }
  const detail = e?.response?.data ? ` — ${JSON.stringify(e.response.data)}` : ""
  return (e?.message || "The agent request failed.") + detail
}

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
