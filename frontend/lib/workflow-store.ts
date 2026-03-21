import { randomUUID } from "crypto"
import type { Edge } from "@xyflow/react"
import type { WorkflowNode } from "./workflow-types"

interface WorkflowPayload {
  id?: string
  name: string
  description?: string
  templateId?: string | null
  nodes?: WorkflowNode[]
  edges?: Edge[]
}

interface WorkflowRecord {
  id: string
  name: string
  description?: string
  templateId?: string | null
  nodes: WorkflowNode[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

export interface RunHistoryItem {
  id: string
  workflow_id: string
  status: "pending" | "running" | "completed" | "failed"
  final_output: string | null
  started_at: string
  completed_at: string | null
}

const workflows = new Map<string, WorkflowRecord>()
const workflowHistory = new Map<string, RunHistoryItem[]>()

function buildBaseRecord(payload: WorkflowPayload, existing?: WorkflowRecord) {
  const now = new Date().toISOString()
  return {
    id: payload.id ?? existing?.id ?? randomUUID(),
    name: payload.name,
    description: payload.description ?? existing?.description,
    templateId: payload.templateId ?? existing?.templateId ?? null,
    nodes: payload.nodes ?? existing?.nodes ?? [],
    edges: payload.edges ?? existing?.edges ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export function listWorkflows() {
  return [...workflows.values()].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
}

export function getWorkflow(id: string) {
  return workflows.get(id) ?? null
}

export function saveWorkflow(payload: WorkflowPayload) {
  const existing = payload.id ? workflows.get(payload.id) : undefined
  const record = buildBaseRecord(payload, existing)
  workflows.set(record.id, record)
  return record
}

export function deleteWorkflow(id: string) {
  workflows.delete(id)
  workflowHistory.delete(id)
}

export function logWorkflowExecution(
  workflowId: string,
  entry: Omit<RunHistoryItem, "id" | "workflow_id">
) {
  const list = workflowHistory.get(workflowId) ?? []
  const run: RunHistoryItem = {
    id: randomUUID(),
    workflow_id: workflowId,
    status: entry.status,
    final_output: entry.final_output,
    started_at: entry.started_at,
    completed_at: entry.completed_at,
  }
  list.unshift(run)
  workflowHistory.set(workflowId, list.slice(0, 20))
  return run
}

export function getRunHistory(workflowId: string) {
  return workflowHistory.get(workflowId) ?? []
}
