import { NextResponse } from "next/server"
import { logWorkflowExecution } from "@/lib/workflow-store"
import type { WorkflowNode } from "@/lib/workflow-types"

export async function POST(request: Request) {
  try {
    const { nodes = [], workflowId } = await request.json()
    const startedAt = new Date().toISOString()

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
      logWorkflowExecution(workflowId, {
        status: "completed",
        final_output: finalOutput,
        started_at: startedAt,
        completed_at: completedAt,
      })
    }

    return NextResponse.json({ results, finalOutput })
  } catch (error) {
    console.error("Workflow execute failed", error)
    return NextResponse.json({ error: "Execution failed" }, { status: 500 })
  }
}
