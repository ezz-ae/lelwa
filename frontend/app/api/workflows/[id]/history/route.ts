import { NextResponse } from "next/server"
import { getRunHistory } from "@/lib/workflow-store"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ history: getRunHistory(id) })
}
