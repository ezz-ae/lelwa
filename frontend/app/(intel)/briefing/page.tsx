import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, CalendarCheck, CheckCircle2, FileText, Megaphone, MessageSquare } from "lucide-react"

const deliverables = [
  {
    title: "Lead replies + follow-ups",
    detail: "Instant replies on WhatsApp, calls, and email.",
    icon: MessageSquare,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    dot: "bg-teal-400",
    glow: "rgba(45,212,191,0.15)",
  },
  {
    title: "Ads + listings",
    detail: "Headlines, copy, and creative assets in one click.",
    icon: Megaphone,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    title: "Offers + contracts",
    detail: "Ready-to-send terms, pricing, and documents.",
    icon: FileText,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
    glow: "rgba(244,114,182,0.15)",
  },
]

const dailyWins = [
  {
    title: "Inbox cleared",
    detail: "Every new lead is answered and tagged.",
    status: "done",
    statusLabel: "Complete",
  },
  {
    title: "Viewings scheduled",
    detail: "Suggested slots, reminders, and confirmations sent.",
    status: "done",
    statusLabel: "Complete",
  },
  {
    title: "Offer pack ready",
    detail: "Shareable PDF + message to close faster.",
    status: "ready",
    statusLabel: "Ready",
  },
]

export default function BriefingPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Results</p>
        <h2 className="font-display text-3xl text-foreground">Everything you need to close, done for you</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          No extra tabs, no spreadsheets. Just outcomes that move your deals forward.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* What gets done card */}
        <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What gets done</p>
                <h3 className="text-lg font-semibold text-foreground">Your daily workload, handled</h3>
              </div>
            </div>
            <div className="space-y-2.5">
              {deliverables.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={`flex items-center justify-between rounded-2xl border bg-background/60 p-3.5 transition-colors hover:bg-background/80 ${item.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                    <span
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.color} ${item.border} ${item.bg}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                      Included
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's wins card */}
        <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
          <CardContent className="space-y-5 pt-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today's wins</p>
              <h3 className="text-lg font-semibold text-foreground">Simple outcomes your clients feel</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Lelwa keeps the conversation moving so you can focus on the relationship.
              </p>
            </div>
            <div className="space-y-2.5">
              {dailyWins.map((win) => (
                <div
                  key={win.title}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4 transition-colors hover:bg-background/80"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{win.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{win.detail}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                    {win.statusLabel}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 pt-1">
              <Button asChild className="rounded-full">
                <Link href="/studio">
                  Start a chat
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-border/60">
                <Link href="/connect">Connect accounts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
