import { NextResponse } from "next/server"
import { getRunHistory, logWorkflowExecution } from "@/lib/workflow-store"

const WORKFLOW_API_BASE = (
  process.env.LELWA_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000"
).replace(/\/$/, "")
const DEFAULT_USER_ID = "default"

type RunStatus = "pending" | "running" | "completed" | "failed"
const RUN_STATUSES: RunStatus[] = ["pending", "running", "completed", "failed"]

function normalizeRunStatus(value: unknown): RunStatus {
  return RUN_STATUSES.includes(value as RunStatus) ? (value as RunStatus) : "failed"
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const response = await fetch(
      `${WORKFLOW_API_BASE}/v1/workflows/${encodeURIComponent(id)}/history?user_id=${DEFAULT_USER_ID}`,
      { cache: "no-store" },
    )
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ history: Array.isArray(data?.history) ? data.history : [] })
    }
  } catch (error) {
    console.warn("Workflow history GET backend unavailable, falling back to local store", error)
  }

  return NextResponse.json({ history: getRunHistory(id) })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const payload = await request.json()
    const status = normalizeRunStatus(payload?.status)
    const startedAt =
      typeof payload?.started_at === "string" ? payload.started_at : new Date().toISOString()
    const completedAt =
      typeof payload?.completed_at === "string"
        ? payload.completed_at
        : status === "completed" || status === "failed"
          ? new Date().toISOString()
          : null

    const backendPayload = {
      user_id: DEFAULT_USER_ID,
      status,
      final_output: payload?.final_output ?? null,
      started_at: startedAt,
      completed_at: completedAt,
    }

    try {
      const response = await fetch(`${WORKFLOW_API_BASE}/v1/workflows/${encodeURIComponent(id)}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.warn("Workflow history POST backend unavailable, falling back to local store", error)
    }

    const run = logWorkflowExecution(id, {
      status,
      final_output: backendPayload.final_output,
      started_at: backendPayload.started_at,
      completed_at: backendPayload.completed_at,
    })
    return NextResponse.json({ success: true, run })
  } catch (error) {
    console.error("Failed to save workflow history", error)
    return NextResponse.json({ error: "Failed to save workflow history" }, { status: 500 })
  }
}
