import { NextResponse } from "next/server"
import { listAgents, defaultAgentKey } from "@/lib/agent"

// Lists the configured agent network (no secrets — keys/labels/roles only).
export const runtime = "nodejs"

export function GET() {
  const agents = listAgents().map((a) => ({ key: a.key, label: a.label, role: a.role }))
  return NextResponse.json({ agents, default: defaultAgentKey() })
}
