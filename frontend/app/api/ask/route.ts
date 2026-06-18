import { NextResponse } from "next/server"
import { askAgent, agentErrorMessage } from "@/lib/agent"

// Runs server-side only — the service-account credentials never reach the browser.
export const runtime = "nodejs"

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
    const answer = await askAgent(question)
    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json({ error: agentErrorMessage(err) }, { status: 502 })
  }
}
