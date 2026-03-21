import { NextResponse } from "next/server"
import { logWorkflowExecution } from "@/lib/workflow-store"
import type { WorkflowNode } from "@/lib/workflow-types"

const WORKFLOW_API_BASE = (
  process.env.LELWA_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000"
).replace(/\/$/, "")
const DEFAULT_USER_ID = "default"

async function persistRunHistory(
  workflowId: string,
  status: "completed" | "failed",
  finalOutput: string | null,
  startedAt: string,
  completedAt: string,
) {
  try {
    const response = await fetch(`${WORKFLOW_API_BASE}/v1/workflows/${encodeURIComponent(workflowId)}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        status,
        final_output: finalOutput,
        started_at: startedAt,
        completed_at: completedAt,
      }),
    })

    if (response.ok) {
      return
    }
  } catch (error) {
    console.warn("Workflow history persistence via backend failed, falling back to local store", error)
  }

  logWorkflowExecution(workflowId, {
    status,
    final_output: finalOutput,
    started_at: startedAt,
    completed_at: completedAt,
  })
}

export async function POST(request: Request) {
  const startedAt = new Date().toISOString()
  let workflowId = ""

  try {
    const payload = await request.json()
    const { nodes = [] } = payload
    workflowId = typeof payload?.workflowId === "string" ? payload.workflowId : ""

    const typedNodes = Array.isArray(nodes) ? (nodes as WorkflowNode[]) : []

    const results = typedNodes.map((node) => ({
      nodeId: node.id,
      nodeType: node.type,
      output: node.data?.label ? `Executed ${node.data.label}` : "Executed node",
      error: null,
      timestamp: new Date().toISOString(),
    }))

    const finalOutput = typedNodes.length
      ? typedNodes
          .map((node) => `• [${node.type}] ${node.data?.label ?? node.id}`)
          .join("\n")
      : "Workflow has no nodes yet."

    const completedAt = new Date().toISOString()

    if (workflowId) {
      await persistRunHistory(workflowId, "completed", finalOutput, startedAt, completedAt)
    }

    return NextResponse.json({ results, finalOutput })
  } catch (error) {
    const completedAt = new Date().toISOString()
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (workflowId) {
      await persistRunHistory(
        workflowId,
        "failed",
        `Execution failed: ${errorMessage}`,
        startedAt,
        completedAt,
      )
    }
    console.error("Workflow execute failed", error)
    return NextResponse.json({ error: "Execution failed" }, { status: 500 })
  }
}
