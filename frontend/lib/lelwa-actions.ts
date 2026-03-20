import type { LucideIcon } from "lucide-react"
import {
  MessageSquareText,
  PhoneCall,
  FileText,
  FileSignature,
  RefreshCw,
  Megaphone,
} from "lucide-react"

export type ActionId =
  | "send-reply"
  | "call-lead"
  | "create-offer"
  | "create-contract"
  | "refresh-listing"
  | "run-ads"

export type ActionTheme = {
  id: ActionId
  label: string
  icon: LucideIcon
  stroke: [string, string]
  glow: [string, string]
  iconBackground: string
  iconClass: string
}

export const actionThemes: ActionTheme[] = [
  {
    id: "send-reply",
    label: "Send reply",
    icon: MessageSquareText,
    stroke: ["#38BDF8", "#0EA5E9"],
    glow: ["rgba(56, 189, 248, 0.22)", "rgba(14, 165, 233, 0.14)"],
    iconBackground: "linear-gradient(140deg, rgba(56, 189, 248, 0.28), rgba(14, 165, 233, 0.08))",
    iconClass: "text-sky-200",
  },
  {
    id: "call-lead",
    label: "Call lead",
    icon: PhoneCall,
    stroke: ["#5EEAD4", "#14B8A6"],
    glow: ["rgba(94, 234, 212, 0.2)", "rgba(20, 184, 166, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(94, 234, 212, 0.24), rgba(20, 184, 166, 0.08))",
    iconClass: "text-teal-200",
  },
  {
    id: "create-offer",
    label: "Create offer",
    icon: FileText,
    stroke: ["#FBBF24", "#F59E0B"],
    glow: ["rgba(251, 191, 36, 0.2)", "rgba(245, 158, 11, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(251, 191, 36, 0.22), rgba(245, 158, 11, 0.08))",
    iconClass: "text-amber-200",
  },
  {
    id: "create-contract",
    label: "Create contract",
    icon: FileSignature,
    stroke: ["#34D399", "#10B981"],
    glow: ["rgba(52, 211, 153, 0.2)", "rgba(16, 185, 129, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(52, 211, 153, 0.22), rgba(16, 185, 129, 0.08))",
    iconClass: "text-emerald-200",
  },
  {
    id: "refresh-listing",
    label: "Refresh listing",
    icon: RefreshCw,
    stroke: ["#67E8F9", "#22D3EE"],
    glow: ["rgba(103, 232, 249, 0.18)", "rgba(34, 211, 238, 0.1)"],
    iconBackground: "linear-gradient(140deg, rgba(103, 232, 249, 0.2), rgba(34, 211, 238, 0.08))",
    iconClass: "text-cyan-200",
  },
  {
    id: "run-ads",
    label: "Run ads",
    icon: Megaphone,
    stroke: ["#FB7185", "#F43F5E"],
    glow: ["rgba(251, 113, 133, 0.2)", "rgba(244, 63, 94, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(251, 113, 133, 0.22), rgba(244, 63, 94, 0.08))",
    iconClass: "text-rose-200",
  },
]

export const primaryActions = actionThemes

export const startActionById: Record<ActionId, { label: string; prompt: string }> = {
  "send-reply": {
    label: "Send reply",
    prompt: "Prepare a reply for this lead:",
  },
  "call-lead": {
    label: "Call lead",
    prompt: "Prepare a call script for this lead:",
  },
  "create-offer": {
    label: "Create offer",
    prompt: "Prepare an offer summary for this lead:",
  },
  "create-contract": {
    label: "Create contract",
    prompt: "Prepare contract terms for this request:",
  },
  "refresh-listing": {
    label: "Refresh listing",
    prompt: "Prepare a listing refresh for this property:",
  },
  "run-ads": {
    label: "Run ads",
    prompt: "Prepare ads for this listing:",
  },
}

export const capabilityCards = [
  {
    title: "Prepared reply + call script",
    detail: "Reply text and call script ready for review.",
  },
  {
    title: "Prepared offer + contract",
    detail: "Offer terms and contract language prepared for confirmation.",
  },
  {
    title: "Prepared listing refresh",
    detail: "Listing highlights, updates, and pricing ready to send.",
  },
  {
    title: "Prepared follow-up plan",
    detail: "Follow-up timing and message sequence prepared.",
  },
  {
    title: "Prepared ads",
    detail: "Ad copy and targeting notes ready for approval.",
  },
  {
    title: "Prepared meeting brief",
    detail: "Meeting plan and agenda ready for the client.",
  },
]
