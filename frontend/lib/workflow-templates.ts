import type { Edge } from "@xyflow/react"
import type { ComponentType, SVGProps } from "react"
import type { WorkflowNode } from "./workflow-types"
import { FileText, Bot, BookOpen, Sparkles } from "lucide-react"

export type WorkflowTemplateIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: WorkflowTemplateIcon
  nodes: WorkflowNode[]
  edges: Edge[]
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "readme-generator",
    name: "README Generator",
    description: "Compile repository context into a polished README with sections for overview, usage, and API reference.",
    icon: FileText,
    nodes: [
      {
        id: "github-1",
        type: "github",
        position: { x: 50, y: 200 },
        data: {
          label: "GitHub Repo",
          githubUrl: "",
          branch: "main",
          fetchReadme: true,
          fetchStructure: true,
          fetchKeyFiles: true,
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 450, y: 150 },
        data: {
          label: "Generate README",
          provider: "openai",
          model: "gpt-4o",
          prompt:
            "Based on the following repository context, write a README.md with sections for Overview, Features, Installation, Usage, API Reference, and Contributing guidelines.\n\n{{input}}",
          systemPrompt: "You are a technical documentation expert.",
          temperature: 0.7,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 900, y: 200 },
        data: {
          label: "README Output",
          outputType: "readme-md",
          customFilename: "README.md",
          customTemplate: "",
        },
      },
    ],
    edges: [
      { id: "e1", source: "github-1", target: "ai-1", type: "default", animated: true },
      { id: "e2", source: "ai-1", target: "output-1", type: "default", animated: true },
    ],
  },
  {
    id: "agents-md",
    name: "Agents.md",
    description: "Draft agents.md documentation covering behavior, rules, and best practices for your AI assistants.",
    icon: Bot,
    nodes: [
      {
        id: "github-1",
        type: "github",
        position: { x: 50, y: 80 },
        data: {
          label: "GitHub Repo",
          githubUrl: "",
          branch: "main",
          fetchReadme: true,
          fetchStructure: true,
          fetchKeyFiles: true,
        },
      },
      {
        id: "memory-1",
        type: "memory",
        position: { x: 50, y: 380 },
        data: {
          label: "Project Context",
          memoryKey: "project-rules",
          operation: "read",
          dataType: "text",
          defaultValue: "",
        },
      },
      {
        id: "merge-1",
        type: "merge",
        position: { x: 480, y: 220 },
        data: {
          label: "Combine Context",
          separator: "\n\n---\n\n",
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 880, y: 150 },
        data: {
          label: "Generate Agents.md",
          provider: "openai",
          model: "gpt-4o",
          prompt:
            "Create an agents.md file for AI coding assistants using this project context. Include overview, tech stack, conventions, and guardrails for Cursor, Claude, and Warp.",
          systemPrompt: "You are an authority on documenting AI assistant behaviors.",
          temperature: 0.7,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 1350, y: 220 },
        data: {
          label: "Agents.md",
          outputType: "agents-md",
          agentType: "cursor",
          customFilename: "agents.md",
          customTemplate: "",
        },
      },
    ],
    edges: [
      { id: "e1", source: "github-1", target: "merge-1", type: "default", animated: true },
      { id: "e2", source: "memory-1", target: "merge-1", type: "default", animated: true },
      { id: "e3", source: "merge-1", target: "ai-1", type: "default", animated: true },
      { id: "e4", source: "ai-1", target: "output-1", type: "default", animated: true },
    ],
  },
  {
    id: "wiki-generator",
    name: "Wiki Page",
    description: "Transform a topic into a markdown-rich GitHub Wiki entry that matches your product narrative.",
    icon: BookOpen,
    nodes: [
      {
        id: "text-1",
        type: "textInput",
        position: { x: 50, y: 200 },
        data: {
          label: "Topic Input",
          text: "Enter the topic or feature to document...",
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 450, y: 150 },
        data: {
          label: "Generate Wiki",
          provider: "openai",
          model: "gpt-4o",
          prompt:
            "Write a GitHub Wiki page about the following topic. Use headers, code samples, and adoption guidance where relevant.\n\nTopic: {{input}}",
          systemPrompt: "You are a technical writer crafting developer documentation.",
          temperature: 0.7,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 900, y: 200 },
        data: {
          label: "Wiki Output",
          outputType: "github-wiki",
          customFilename: "Wiki-Page.md",
          customTemplate: "",
        },
      },
    ],
    edges: [
      { id: "e1", source: "text-1", target: "ai-1", type: "default", animated: true },
      { id: "e2", source: "ai-1", target: "output-1", type: "default", animated: true },
    ],
  },
  {
    id: "blank",
    name: "Blank Flow",
    description: "Start with an empty canvas and build the automation that matches your deal or ops work.",
    icon: Sparkles,
    nodes: [],
    edges: [],
  },
]
