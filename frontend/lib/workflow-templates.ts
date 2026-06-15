import type { Edge } from "@xyflow/react"
import type { ComponentType, SVGProps } from "react"
import type { WorkflowNode } from "./workflow-types"
import { MessageSquare, House, FilePen, CalendarClock } from "lucide-react"

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
    id: "lead-reply",
    name: "Lead reply",
    description: "Turn a new lead message into a ready WhatsApp reply, a call script, and next steps.",
    icon: MessageSquare,
    nodes: [
      {
        id: "text-1",
        type: "textInput",
        position: { x: 50, y: 200 },
        data: {
          label: "Lead details",
          text: "Paste the lead message, budget, area, and bedrooms...",
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 450, y: 150 },
        data: {
          label: "Prepare reply",
          provider: "google",
          model: "gemini-2.0-flash",
          prompt:
            "From the lead details below, prepare three things a Dubai broker can send right away:\n1) A short WhatsApp reply that answers the lead and asks one qualifying question.\n2) A brief call script with an opener, three questions, and a close.\n3) Three concrete next steps with timing.\nKeep it plain and ready to send.\n\n{{input}}",
          systemPrompt: "You prepare ready-to-send broker replies for Dubai real estate leads. Be concrete and concise.",
          temperature: 0.6,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 900, y: 200 },
        data: {
          label: "Reply",
          outputType: "custom",
          customFilename: "lead-reply.md",
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
    id: "listing-launch",
    name: "Listing launch",
    description: "Turn listing details into a description, an ad caption, and a viewing plan.",
    icon: House,
    nodes: [
      {
        id: "text-1",
        type: "textInput",
        position: { x: 50, y: 200 },
        data: {
          label: "Listing details",
          text: "Paste the property type, area, size, price, and key features...",
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 450, y: 150 },
        data: {
          label: "Prepare listing",
          provider: "google",
          model: "gemini-2.0-flash",
          prompt:
            "From the listing details below, prepare three things for a Dubai broker:\n1) A polished listing description for the portals.\n2) A short ad caption with three hashtags.\n3) A viewing plan with suggested slots and what to highlight on the tour.\nKeep it accurate to the details given.\n\n{{input}}",
          systemPrompt: "You prepare listing copy and viewing plans for Dubai real estate brokers. Stay accurate to the facts provided.",
          temperature: 0.7,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 900, y: 200 },
        data: {
          label: "Listing pack",
          outputType: "custom",
          customFilename: "listing-launch.md",
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
    id: "offer-close",
    name: "Offer & close",
    description: "Turn a buyer's terms into an offer summary, a contract outline, and a closing call script.",
    icon: FilePen,
    nodes: [
      {
        id: "text-1",
        type: "textInput",
        position: { x: 50, y: 200 },
        data: {
          label: "Buyer terms",
          text: "Paste the buyer's offer price, payment plan, conditions, and timeline...",
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 450, y: 150 },
        data: {
          label: "Prepare offer",
          provider: "google",
          model: "gemini-2.0-flash",
          prompt:
            "From the buyer's terms below, prepare three things for a Dubai broker:\n1) A clear offer summary the seller can review.\n2) A contract outline listing the key clauses to confirm.\n3) A closing call script to walk the buyer through the next steps.\nMark anything that needs the parties to confirm.\n\n{{input}}",
          systemPrompt: "You prepare offer summaries and closing scripts for Dubai real estate deals. Flag items that need confirmation; do not give legal advice.",
          temperature: 0.5,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 900, y: 200 },
        data: {
          label: "Offer pack",
          outputType: "custom",
          customFilename: "offer-close.md",
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
    id: "follow-up",
    name: "Follow-up sequence",
    description: "Draft a sequenced set of follow-ups and meeting nudges to keep a deal moving.",
    icon: CalendarClock,
    nodes: [
      {
        id: "text-1",
        type: "textInput",
        position: { x: 50, y: 200 },
        data: {
          label: "Deal status",
          text: "Paste where the deal stands, last contact, and what you need next...",
        },
      },
      {
        id: "ai-1",
        type: "aiText",
        position: { x: 450, y: 150 },
        data: {
          label: "Prepare follow-ups",
          provider: "google",
          model: "gemini-2.0-flash",
          prompt:
            "From the deal status below, draft a sequenced set of follow-ups for a Dubai broker:\n1) A WhatsApp follow-up for day 1, day 3, and day 7.\n2) A short meeting nudge to book a viewing or call.\n3) A note on when to stop following up.\nKeep each message short and easy to send.\n\n{{input}}",
          systemPrompt: "You draft polite, sequenced follow-ups for Dubai real estate brokers. Keep each message short and respectful.",
          temperature: 0.6,
        },
      },
      {
        id: "output-1",
        type: "output",
        position: { x: 900, y: 200 },
        data: {
          label: "Follow-up plan",
          outputType: "custom",
          customFilename: "follow-up-sequence.md",
          customTemplate: "",
        },
      },
    ],
    edges: [
      { id: "e1", source: "text-1", target: "ai-1", type: "default", animated: true },
      { id: "e2", source: "ai-1", target: "output-1", type: "default", animated: true },
    ],
  },
]
