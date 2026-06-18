import { NextResponse } from "next/server"
import { generatePlan, agentErrorMessage } from "@/lib/agent"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let goal = ""
  let plan: string | undefined
  let refine: string | undefined
  try {
    const body = await req.json()
    goal = String(body?.goal ?? "").trim()
    plan = body?.plan ? String(body.plan) : undefined
    refine = body?.refine ? String(body.refine) : undefined
  } catch {
    /* ignore */
  }
  if (!goal) {
    return NextResponse.json({ error: "Describe your goal first." }, { status: 400 })
  }
  try {
    const result = await generatePlan(goal, plan, refine)
    return NextResponse.json({ plan: result })
  } catch (err) {
    return NextResponse.json({ error: agentErrorMessage(err) }, { status: 502 })
  }
}
