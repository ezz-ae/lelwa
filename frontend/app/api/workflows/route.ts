import { NextResponse } from "next/server"
import { listWorkflows, saveWorkflow } from "@/lib/workflow-store"

export async function GET() {
  return NextResponse.json({ workflows: listWorkflows() })
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    if (!payload?.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const workflow = saveWorkflow(payload)
    return NextResponse.json({ workflow })
  } catch (error) {
    console.error("Failed to save workflow", error)
    return NextResponse.json({ error: "Failed to save workflow" }, { status: 500 })
  }
}
