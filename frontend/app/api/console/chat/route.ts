import { NextResponse } from "next/server"
import { askAgent, agentErrorMessage } from "@/lib/agent"

// The console (/studio) posts here instead of the FastAPI backend, so the work
// feed is driven by the Vertex agent. Returns the same contract /v1/chat did.
export const runtime = "nodejs"

const STANDARD_ACTIONS = [
  { id: "send_whatsapp", label: "Send WhatsApp", tool_name: "send_whatsapp", args: {}, requires: "connection" },
  { id: "call_investor", label: "Call lead", tool_name: "call_investor", args: {}, requires: "connection" },
]

export async function POST(req: Request) {
  let message = ""
  let sessionId = ""
  let agent: string | undefined
  try {
    const body = await req.json()
    message = String(body?.message ?? "").trim()
    sessionId = String(body?.session_id ?? "")
    agent = body?.agent ? String(body.agent) : undefined
  } catch {
    /* ignore */
  }
  if (!message) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 })
  }

  const timestamp = new Date().toISOString()

  try {
    const answer = await askAgent(message, agent)
    return NextResponse.json({
      reply: answer,
      prepared_blocks: [{ type: "reply", title: "Reply", content: answer }],
      prepared_actions: STANDARD_ACTIONS,
      artifacts: [],
      session_id: sessionId,
      timestamp,
    })
  } catch (err) {
    // Surface the real agent error in the feed instead of a misleading stub.
    const note = `Agent unavailable — ${agentErrorMessage(err)}`
    return NextResponse.json({
      reply: note,
      prepared_blocks: [{ type: "reply", title: "Reply", content: note }],
      prepared_actions: [],
      degraded: true,
      session_id: sessionId,
      timestamp,
    })
  }
}
