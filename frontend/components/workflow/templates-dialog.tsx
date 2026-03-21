"use client"

import React, { useRef, useEffect } from "react"
import type { WorkflowNode } from "@/lib/workflow-types"
import type { Edge } from "@xyflow/react"
import { WORKFLOW_TEMPLATES } from "@/lib/workflow-templates"

interface TemplatesDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (templateId: string, nodes: WorkflowNode[], edges: Edge[], name: string) => void
}

export function TemplatesDialog({ isOpen, onClose, onSelectTemplate }: TemplatesDialogProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 mt-2 z-50 bg-workflow-surface border border-workflow-border rounded-lg shadow-xl min-w-[260px] transition-colors duration-200"
    >
      <div className="px-3 py-2 border-b border-workflow-border">
        <span className="text-[10px] font-mono uppercase tracking-wider text-workflow-text-muted">
          Templates
        </span>
      </div>

      <div className="py-1">
        {WORKFLOW_TEMPLATES.map((template) => {
          const Icon = template.icon
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onSelectTemplate(template.id, template.nodes, template.edges, template.name)
                onClose()
              }}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-workflow-surface-hover transition-colors duration-200 text-left"
            >
              <Icon className="w-4 h-4 text-workflow-text-muted mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-workflow-text">{template.name}</div>
                <div className="text-xs text-workflow-text-muted mt-0.5">{template.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
