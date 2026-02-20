import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, CalendarCheck, FileText, Megaphone, MessageSquare } from "lucide-react"

const deliverables = [
  {
    title: "Lead replies + follow-ups",
    detail: "Instant replies on WhatsApp, calls, and email.",
    icon: MessageSquare,
  },
  {
    title: "Ads + listings",
    detail: "Headlines, copy, and creative assets in one click.",
    icon: Megaphone,
  },
  {
    title: "Offers + contracts",
    detail: "Ready-to-send terms, pricing, and documents.",
    icon: FileText,
  },
]

const dailyWins = [
  {
    title: "Inbox cleared",
    detail: "Every new lead is answered and tagged.",
  },
  {
    title: "Viewings scheduled",
    detail: "Suggested slots, reminders, and confirmations sent.",
  },
  {
    title: "Offer pack ready",
    detail: "Shareable PDF + message to close faster.",
  },
]

export default function BriefingPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Results</p>
        <h2 className="font-display text-3xl text-foreground">Everything you need to close, done for you</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          No extra tabs, no spreadsheets. Just outcomes that move your deals forward.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border-border/60">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What gets done</p>
                <h3 className="text-lg font-semibold text-foreground">Your daily workload, handled</h3>
              </div>
            </div>
            <div className="space-y-3">
              {deliverables.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-muted/40 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-background/60">
                      Included
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border-border/60">
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today’s wins</p>
              <h3 className="text-lg font-semibold text-foreground">Simple outcomes your clients feel</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Lelwa keeps the conversation moving so you can focus on the relationship.
              </p>
            </div>
            <div className="space-y-3">
              {dailyWins.map((win) => (
                <div key={win.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="text-sm font-medium text-foreground">{win.title}</p>
                  <p className="text-xs text-muted-foreground mt-2">{win.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
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
