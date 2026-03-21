import { NextResponse } from "next/server"
import { listWorkflows, saveWorkflow } from "@/lib/workflow-store"

const WORKFLOW_API_BASE = (
  process.env.LELWA_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000"
).replace(/\/$/, "")
const DEFAULT_USER_ID = "default"
const ALLOW_LOCAL_FALLBACK = process.env.NODE_ENV !== "production"

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

function getBackendPayload(payload: any) {
  return {
    id: typeof payload?.id === "string" ? payload.id : undefined,
    user_id: DEFAULT_USER_ID,
    name: payload?.name,
    description: payload?.description ?? null,
    template_id: payload?.template_id ?? payload?.templateId ?? null,
    nodes: Array.isArray(payload?.nodes) ? payload.nodes : [],
    edges: Array.isArray(payload?.edges) ? payload.edges : [],
  }
}

export async function GET() {
  try {
    const response = await fetch(`${WORKFLOW_API_BASE}/v1/workflows?user_id=${DEFAULT_USER_ID}`, {
      cache: "no-store",
    })
    if (response.ok) {
      const data = await response.json()
      const workflows = Array.isArray(data?.workflows)
        ? data.workflows.map((workflow: WorkflowResponseShape) => normalizeWorkflow(workflow))
        : []
      return NextResponse.json({ workflows })
    }
    if (!ALLOW_LOCAL_FALLBACK) {
      return NextResponse.json({ error: "Workflow backend unavailable" }, { status: response.status || 502 })
    }
  } catch (error) {
    console.warn("Workflow GET backend unavailable, falling back to local store", error)
    if (!ALLOW_LOCAL_FALLBACK) {
      return NextResponse.json({ error: "Workflow backend unavailable" }, { status: 502 })
    }
  }

  return NextResponse.json({ workflows: listWorkflows().map((workflow) => normalizeWorkflow(workflow)) })
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    if (!payload?.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const backendPayload = getBackendPayload(payload)
    try {
      const response = await fetch(`${WORKFLOW_API_BASE}/v1/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      })
      if (response.ok) {
        const result = await response.json()
        return NextResponse.json({ workflow: normalizeWorkflow(result.workflow ?? {}) })
      }
      if (!ALLOW_LOCAL_FALLBACK) {
        return NextResponse.json({ error: "Workflow backend unavailable" }, { status: response.status || 502 })
      }
    } catch (error) {
      console.warn("Workflow POST backend unavailable, falling back to local store", error)
      if (!ALLOW_LOCAL_FALLBACK) {
        return NextResponse.json({ error: "Workflow backend unavailable" }, { status: 502 })
      }
    }

    const workflow = saveWorkflow({
      id: backendPayload.id,
      name: backendPayload.name,
      description: backendPayload.description ?? undefined,
      templateId: backendPayload.template_id,
      nodes: backendPayload.nodes as any,
      edges: backendPayload.edges as any,
    })
    return NextResponse.json({ workflow: normalizeWorkflow(workflow) })
  } catch (error) {
    console.error("Failed to save workflow", error)
    return NextResponse.json({ error: "Failed to save workflow" }, { status: 500 })
  }
}
