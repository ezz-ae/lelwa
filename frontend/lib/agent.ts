import { GoogleAuth } from "google-auth-library"

// ── Agent network ────────────────────────────────────────────────────────────
// Lelwa talks to a NETWORK of Vertex AI Agent Engine agents (marketing, lead,
// listing, offer, follow-up, voice …). Configure the network with the VERTEX_AGENTS
// env var (JSON); adding an agent is config, not code. Falls back to the single
// marketing agent so existing deploys keep working.
//
// VERTEX_AGENTS example (one line):
//   [{"key":"marketing","label":"Marketing","role":"runs & explores ads","engineId":"2989271399492747264"},
//    {"key":"lead","label":"Lead reply","engineId":"<id>"}]

export interface AgentConfig {
  key: string
  label: string
  role?: string
  project: string
  location: string
  engineId: string
}

const DEFAULT_PROJECT = process.env.VERTEX_PROJECT_ID || "610006155413"
const DEFAULT_LOCATION = process.env.VERTEX_LOCATION || "us-central1"
const INPUT_KEY = process.env.VERTEX_INPUT_KEY || "input"

function loadAgents(): AgentConfig[] {
  const raw = process.env.VERTEX_AGENTS
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Array<Partial<AgentConfig>>
      const agents = parsed
        .filter((a) => a.key && a.engineId)
        .map((a) => ({
          key: String(a.key),
          label: a.label || String(a.key),
          role: a.role,
          project: a.project || DEFAULT_PROJECT,
          location: a.location || DEFAULT_LOCATION,
          engineId: String(a.engineId),
        }))
      if (agents.length) return agents
    } catch {
      /* fall through to single-agent default */
    }
  }
  return [
    {
      key: "marketing",
      label: "Marketing",
      role: "Explores marketing agencies / runs ads",
      project: DEFAULT_PROJECT,
      location: DEFAULT_LOCATION,
      engineId: process.env.VERTEX_REASONING_ENGINE_ID || "2989271399492747264",
    },
  ]
}

let cached: AgentConfig[] | null = null
export function listAgents(): AgentConfig[] {
  if (!cached) cached = loadAgents()
  return cached
}

export function defaultAgentKey(): string {
  const want = process.env.VERTEX_DEFAULT_AGENT
  const agents = listAgents()
  return (want && agents.find((a) => a.key === want)?.key) || agents[0]?.key
}

export function getAgent(key?: string): AgentConfig | null {
  const agents = listAgents()
  return agents.find((a) => a.key === (key || defaultAgentKey())) || agents[0] || null
}

function serviceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) return undefined // fall back to Application Default Credentials
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/** Query an agent in the network by key (default agent if omitted). Throws on failure. */
export async function askAgent(question: string, agentKey?: string): Promise<string> {
  const agent = getAgent(agentKey)
  if (!agent) throw new Error("No agent configured.")
  const auth = new GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  })
  const client = await auth.getClient()
  const url = `https://${agent.location}-aiplatform.googleapis.com/v1/projects/${agent.project}/locations/${agent.location}/reasoningEngines/${agent.engineId}:query`
  const payload = { class_method: "query", input: { [INPUT_KEY]: question } }
  const res = await client.request<Record<string, unknown>>({ url, method: "POST", data: payload })
  return extractText(res.data) ?? "The agent returned no answer."
}

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
