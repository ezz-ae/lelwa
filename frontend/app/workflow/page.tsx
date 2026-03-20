"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { WorkflowEditor } from "@/components/workflow/workflow-editor"
import { WORKFLOW_TEMPLATES } from "@/lib/workflow-templates"

export default function WorkflowPage() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const selectedTemplate = useMemo(
    () => WORKFLOW_TEMPLATES.find((template) => template.id === templateId),
    [templateId],
  )

  return <WorkflowEditor template={selectedTemplate} />
}
