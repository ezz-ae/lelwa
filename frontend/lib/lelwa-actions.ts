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
    stroke: ["#60A5FA", "#2563EB"],
    glow: ["rgba(96, 165, 250, 0.22)", "rgba(37, 99, 235, 0.14)"],
    iconBackground: "linear-gradient(140deg, rgba(96, 165, 250, 0.25), rgba(37, 99, 235, 0.08))",
    iconClass: "text-blue-700",
  },
  {
    id: "call-lead",
    label: "Call lead",
    icon: PhoneCall,
    stroke: ["#2DD4BF", "#0F766E"],
    glow: ["rgba(45, 212, 191, 0.2)", "rgba(15, 118, 110, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(45, 212, 191, 0.22), rgba(15, 118, 110, 0.08))",
    iconClass: "text-teal-700",
  },
  {
    id: "create-offer",
    label: "Create offer",
    icon: FileText,
    stroke: ["#F59E0B", "#F97316"],
    glow: ["rgba(245, 158, 11, 0.2)", "rgba(249, 115, 22, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(245, 158, 11, 0.24), rgba(249, 115, 22, 0.08))",
    iconClass: "text-amber-700",
  },
  {
    id: "create-contract",
    label: "Create contract",
    icon: FileSignature,
    stroke: ["#34D399", "#059669"],
    glow: ["rgba(52, 211, 153, 0.2)", "rgba(5, 150, 105, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(52, 211, 153, 0.22), rgba(5, 150, 105, 0.08))",
    iconClass: "text-emerald-700",
  },
  {
    id: "refresh-listing",
    label: "Refresh listing",
    icon: RefreshCw,
    stroke: ["#A78BFA", "#6366F1"],
    glow: ["rgba(167, 139, 250, 0.18)", "rgba(99, 102, 241, 0.1)"],
    iconBackground: "linear-gradient(140deg, rgba(167, 139, 250, 0.2), rgba(99, 102, 241, 0.08))",
    iconClass: "text-indigo-700",
  },
  {
    id: "run-ads",
    label: "Run ads",
    icon: Megaphone,
    stroke: ["#FB7185", "#F97316"],
    glow: ["rgba(251, 113, 133, 0.2)", "rgba(249, 115, 22, 0.12)"],
    iconBackground: "linear-gradient(140deg, rgba(251, 113, 133, 0.2), rgba(249, 115, 22, 0.08))",
    iconClass: "text-rose-700",
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
