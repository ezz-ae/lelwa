import { NextResponse } from "next/server"
import { deleteWorkflow, getWorkflow, saveWorkflow } from "@/lib/workflow-store"

const WORKFLOW_API_BASE = (
  process.env.LELWA_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000"
).replace(/\/$/, "")
const DEFAULT_USER_ID = "default"

type WorkflowResponseShape = {
  id?: string
  name?: string
  description?: string
  template_id?: string | null
  templateId?: string | null
  nodes?: unknown[]
  edges?: unknown[]
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
}

function normalizeWorkflow(workflow: WorkflowResponseShape) {
  const createdAt = workflow.created_at ?? workflow.createdAt ?? new Date().toISOString()
  const updatedAt = workflow.updated_at ?? workflow.updatedAt ?? createdAt
  const templateId = workflow.template_id ?? workflow.templateId ?? null

  return {
    id: workflow.id ?? "",
    name: workflow.name ?? "Untitled Workflow",
    description: workflow.description,
    template_id: templateId,
    templateId,
    nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
    edges: Array.isArray(workflow.edges) ? workflow.edges : [],
    created_at: createdAt,
    createdAt,
    updated_at: updatedAt,
    updatedAt,
  }
}

function getBackendPayload(payload: any, id: string, existingName?: string) {
  return {
    id,
    user_id: DEFAULT_USER_ID,
    name: payload?.name ?? existingName ?? "Untitled Workflow",
    description: payload?.description ?? null,
    template_id: payload?.template_id ?? payload?.templateId ?? null,
    nodes: Array.isArray(payload?.nodes) ? payload.nodes : [],
    edges: Array.isArray(payload?.edges) ? payload.edges : [],
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const response = await fetch(
      `${WORKFLOW_API_BASE}/v1/workflows/${encodeURIComponent(id)}?user_id=${DEFAULT_USER_ID}`,
      { cache: "no-store" },
    )
    if (response.ok) {
      const result = await response.json()
      return NextResponse.json({ workflow: normalizeWorkflow(result.workflow ?? {}) })
    }
  } catch (error) {
    console.warn("Workflow GET by id backend unavailable, falling back to local store", error)
  }

  const workflow = getWorkflow(id)
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }
  return NextResponse.json({ workflow: normalizeWorkflow(workflow) })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await request.json()
    const existing = getWorkflow(id)
    const backendPayload = getBackendPayload(payload, id, existing?.name)

    try {
      const response = await fetch(`${WORKFLOW_API_BASE}/v1/workflows/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      })
      if (response.ok) {
        const result = await response.json()
        return NextResponse.json({ workflow: normalizeWorkflow(result.workflow ?? {}) })
      }
    } catch (error) {
      console.warn("Workflow PUT backend unavailable, falling back to local store", error)
    }

    const workflow = saveWorkflow({
      id,
      name: backendPayload.name,
      description: backendPayload.description ?? undefined,
      templateId: backendPayload.template_id,
      nodes: backendPayload.nodes as any,
      edges: backendPayload.edges as any,
    })
    return NextResponse.json({ workflow: normalizeWorkflow(workflow) })
  } catch (error) {
    console.error("Failed to update workflow", error)
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let deletedRemote = false

  try {
    const response = await fetch(
      `${WORKFLOW_API_BASE}/v1/workflows/${encodeURIComponent(id)}?user_id=${DEFAULT_USER_ID}`,
      { method: "DELETE" },
    )
    deletedRemote = response.ok
  } catch (error) {
    console.warn("Workflow DELETE backend unavailable, falling back to local store", error)
  }

  const local = getWorkflow(id)
  if (local) {
    deleteWorkflow(id)
  }

  if (!deletedRemote && !local) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
