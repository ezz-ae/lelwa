import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  FileSignature,
  FileText,
  LineChart,
  Megaphone,
  PhoneCall,
  RefreshCw,
  Search,
} from "lucide-react"

export type ActionId =
  | "run-ads"
  | "refresh-listing"
  | "qualify-leads"
  | "create-offer"
  | "create-contract"
  | "learn-market"
  | "search-special-offers"
  | "calls"

export type ActionTheme = {
  id: ActionId
  label: string
  icon: LucideIcon
  stroke: [string, string]
  glow: [string, string]
  chip: {
    border: string
    background: string
    idleBorder: string
    idleBackground: string
  }
  iconBackground: string
  iconClass: string
}

export const actionThemes: ActionTheme[] = [
  {
    id: "run-ads",
    label: "Run Ads",
    icon: Megaphone,
    stroke: ["#F59E0B", "#F97316"],
    glow: ["rgba(245, 158, 11, 0.22)", "rgba(249, 115, 22, 0.16)"],
    chip: {
      border: "rgba(245, 158, 11, 0.45)",
      background: "rgba(245, 158, 11, 0.14)",
      idleBorder: "rgba(245, 158, 11, 0.24)",
      idleBackground: "rgba(245, 158, 11, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(249, 115, 22, 0.12))",
    iconClass: "text-amber-200",
  },
  {
    id: "refresh-listing",
    label: "Refresh Listing",
    icon: RefreshCw,
    stroke: ["#60A5FA", "#2563EB"],
    glow: ["rgba(96, 165, 250, 0.22)", "rgba(37, 99, 235, 0.16)"],
    chip: {
      border: "rgba(96, 165, 250, 0.45)",
      background: "rgba(96, 165, 250, 0.14)",
      idleBorder: "rgba(96, 165, 250, 0.24)",
      idleBackground: "rgba(96, 165, 250, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.12))",
    iconClass: "text-sky-200",
  },
  {
    id: "qualify-leads",
    label: "Qualify Leads",
    icon: CheckCircle2,
    stroke: ["#2DD4BF", "#22C55E"],
    glow: ["rgba(45, 212, 191, 0.22)", "rgba(34, 197, 94, 0.16)"],
    chip: {
      border: "rgba(45, 212, 191, 0.45)",
      background: "rgba(45, 212, 191, 0.14)",
      idleBorder: "rgba(45, 212, 191, 0.24)",
      idleBackground: "rgba(45, 212, 191, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(45, 212, 191, 0.35), rgba(34, 197, 94, 0.12))",
    iconClass: "text-teal-200",
  },
  {
    id: "create-offer",
    label: "Create Offer",
    icon: FileText,
    stroke: ["#F472B6", "#FB7185"],
    glow: ["rgba(244, 114, 182, 0.22)", "rgba(251, 113, 133, 0.16)"],
    chip: {
      border: "rgba(244, 114, 182, 0.45)",
      background: "rgba(244, 114, 182, 0.14)",
      idleBorder: "rgba(244, 114, 182, 0.24)",
      idleBackground: "rgba(244, 114, 182, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(244, 114, 182, 0.35), rgba(251, 113, 133, 0.12))",
    iconClass: "text-rose-200",
  },
  {
    id: "create-contract",
    label: "Create Contract",
    icon: FileSignature,
    stroke: ["#34D399", "#10B981"],
    glow: ["rgba(52, 211, 153, 0.22)", "rgba(16, 185, 129, 0.16)"],
    chip: {
      border: "rgba(52, 211, 153, 0.45)",
      background: "rgba(52, 211, 153, 0.14)",
      idleBorder: "rgba(52, 211, 153, 0.24)",
      idleBackground: "rgba(52, 211, 153, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(52, 211, 153, 0.35), rgba(16, 185, 129, 0.12))",
    iconClass: "text-emerald-200",
  },
  {
    id: "learn-market",
    label: "Learn the Market",
    icon: LineChart,
    stroke: ["#FACC15", "#EAB308"],
    glow: ["rgba(250, 204, 21, 0.22)", "rgba(234, 179, 8, 0.16)"],
    chip: {
      border: "rgba(250, 204, 21, 0.45)",
      background: "rgba(250, 204, 21, 0.14)",
      idleBorder: "rgba(250, 204, 21, 0.24)",
      idleBackground: "rgba(250, 204, 21, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(250, 204, 21, 0.35), rgba(234, 179, 8, 0.12))",
    iconClass: "text-amber-100",
  },
  {
    id: "search-special-offers",
    label: "Search Special Offers",
    icon: Search,
    stroke: ["#A78BFA", "#818CF8"],
    glow: ["rgba(167, 139, 250, 0.22)", "rgba(129, 140, 248, 0.16)"],
    chip: {
      border: "rgba(167, 139, 250, 0.45)",
      background: "rgba(167, 139, 250, 0.14)",
      idleBorder: "rgba(167, 139, 250, 0.24)",
      idleBackground: "rgba(167, 139, 250, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(167, 139, 250, 0.35), rgba(129, 140, 248, 0.12))",
    iconClass: "text-indigo-200",
  },
  {
    id: "calls",
    label: "Call Leads",
    icon: PhoneCall,
    stroke: ["#22D3EE", "#0EA5E9"],
    glow: ["rgba(34, 211, 238, 0.22)", "rgba(14, 165, 233, 0.16)"],
    chip: {
      border: "rgba(34, 211, 238, 0.45)",
      background: "rgba(34, 211, 238, 0.14)",
      idleBorder: "rgba(34, 211, 238, 0.24)",
      idleBackground: "rgba(34, 211, 238, 0.06)",
    },
    iconBackground: "linear-gradient(135deg, rgba(34, 211, 238, 0.35), rgba(14, 165, 233, 0.12))",
    iconClass: "text-cyan-200",
  },
]

export const actionThemeById = Object.fromEntries(actionThemes.map((theme) => [theme.id, theme])) as Record<
  ActionId,
  ActionTheme
>

export const primaryActionIds: ActionId[] = [
  "run-ads",
  "refresh-listing",
  "qualify-leads",
  "create-offer",
  "create-contract",
  "learn-market",
  "search-special-offers",
]

export const primaryActions = primaryActionIds.map((id) => actionThemeById[id])
export const activationActions = [...primaryActionIds, "calls"] as ActionId[]
export const chatActions = activationActions.map((id) => actionThemeById[id])

export const neutralActionTheme: ActionTheme = {
  id: "run-ads",
  label: "Run Ads",
  icon: Megaphone,
  stroke: ["rgba(148, 163, 184, 0.4)", "rgba(148, 163, 184, 0.1)"],
  glow: ["rgba(148, 163, 184, 0.2)", "rgba(148, 163, 184, 0.04)"],
  chip: {
    border: "rgba(148, 163, 184, 0.4)",
    background: "rgba(148, 163, 184, 0.12)",
    idleBorder: "rgba(148, 163, 184, 0.3)",
    idleBackground: "rgba(148, 163, 184, 0.08)",
  },
  iconBackground: "linear-gradient(135deg, rgba(148, 163, 184, 0.35), rgba(148, 163, 184, 0.12))",
  iconClass: "text-slate-200",
}

export const getActionTheme = (id?: string | null) => {
  if (!id) return neutralActionTheme
  return actionThemeById[id as ActionId] ?? neutralActionTheme
}
