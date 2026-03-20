import { NextResponse } from "next/server"
import { deleteWorkflow, getWorkflow, saveWorkflow } from "@/lib/workflow-store"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const workflow = getWorkflow(id)
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }
  return NextResponse.json({ workflow })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await request.json()
    const workflow = saveWorkflow({ id, ...payload })
    return NextResponse.json({ workflow })
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
  deleteWorkflow(id)
  return NextResponse.json({ success: true })
}
