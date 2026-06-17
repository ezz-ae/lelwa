import { GoogleAuth } from "google-auth-library"

// Dubay's market AI. Mirrors Freehold's proven setup: Vertex AI `generateContent`
// (Gemini 2.5) authed with a service account, so the SAME env works here 1:1.
// Auth precedence: VERTEX_AI_API_KEY → VERTEX_AI_SERVICE_ACCOUNT_JSON → GOOGLE_SERVICE_ACCOUNT_JSON.
// Project id is derived from the service-account JSON (env override available).

const DEFAULT_PROJECT = "gen-lang-client-0814069297"
const VERTEX_LOCATION = process.env.GOOGLE_CLOUD_REGION || process.env.VERTEX_LOCATION || "us-central1"
const MODEL = process.env.DUBAY_MODEL || "gemini-2.5-flash"

const SYSTEM_PROMPT = `You are Dubay — the AI of the Dubai real-estate market.

You help investors, buyers, brokers, and developers understand Dubai property:
projects and communities, prices, ROI and rental yields, payment plans, off-plan
launches, fees, and the Golden Visa.

Style: concise, concrete, and grounded. Use AED for money. Prefer short paragraphs
and tight bullet lists. When you lack live figures, say so plainly and explain what
would sharpen the answer — never invent specific prices, project names, or numbers.
You are an assistant, not a licensed advisor; for an actual transaction, suggest
confirming with a licensed Dubai broker.`

let cachedToken: string | null = null
let tokenExpiry = 0
let cachedProject: string | null = null

function serviceAccountJson(): string | undefined {
  return process.env.VERTEX_AI_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON
}

export function vertexConfigured(): boolean {
  return Boolean(process.env.VERTEX_AI_API_KEY || serviceAccountJson())
}

function resolveProject(): string {
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT
  if (process.env.VERTEX_PROJECT_ID) return process.env.VERTEX_PROJECT_ID
  if (cachedProject) return cachedProject
  const json = serviceAccountJson()
  if (json) {
    try {
      const p = JSON.parse(json)?.project_id
      if (p) {
        cachedProject = p
        return p
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_PROJECT
}

async function authHeaders(): Promise<Record<string, string>> {
  const apiKey = process.env.VERTEX_AI_API_KEY
  if (apiKey) return { "x-goog-api-key": apiKey }

  const json = serviceAccountJson()
  if (!json) {
    throw new Error("Vertex AI is not configured. Set VERTEX_AI_SERVICE_ACCOUNT_JSON (service-account JSON).")
  }
  if (cachedToken && Date.now() < tokenExpiry) {
    return { Authorization: `Bearer ${cachedToken}` }
  }
  const auth = new GoogleAuth({
    credentials: JSON.parse(json),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  })
  const client = await auth.getClient()
  const tokenRes = await client.getAccessToken()
  if (!tokenRes.token) throw new Error("Failed to obtain Vertex AI access token.")
  cachedToken = tokenRes.token
  tokenExpiry = Date.now() + 55 * 60 * 1000
  return { Authorization: `Bearer ${cachedToken}` }
}

export interface Turn {
  role: "user" | "model"
  text: string
}

/** Ask Dubay. Optional prior turns give multi-turn context. Throws on failure. */
export async function askAgent(question: string, history: Turn[] = []): Promise<string> {
  const headers = await authHeaders()
  const project = resolveProject()
  const url =
    `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${project}` +
    `/locations/${VERTEX_LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const contents = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: "user" as const, parts: [{ text: question }] },
  ]

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 2048,
      // 2.5 Flash "thinks" by default and can exhaust the budget → disable for direct answers.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => `HTTP ${res.status}`)
    throw new Error(`Vertex generateContent error (${res.status}): ${err}`)
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") || "No answer returned."
}

export function agentErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "The agent request failed."
}

// Minimal network info for /api/agents (kept for the multi-agent UI later).
export function listAgents() {
  return [{ key: "dubay", label: "Dubay", role: `Dubai real-estate market AI (${MODEL})` }]
}
export function defaultAgentKey() {
  return "dubay"
}
