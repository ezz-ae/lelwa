import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, CheckCircle2 } from "lucide-react"

const channels = [
  {
    title: "WhatsApp",
    detail: "Reply to new leads and send offers fast.",
    status: "recommended",
    iconColor: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
    iconLabel: "W",
    accentColor: "border-[#25D366]/30",
    bgAccent: "from-[#25D366]/5",
  },
  {
    title: "Instagram",
    detail: "Answer DMs and keep every inquiry warm.",
    status: "available",
    iconColor: "bg-[#E1306C]/15 text-[#E1306C] border-[#E1306C]/20",
    iconLabel: "In",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    title: "Facebook",
    detail: "Respond to page leads without delay.",
    status: "available",
    iconColor: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/20",
    iconLabel: "f",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    title: "Email",
    detail: "Send documents and follow-ups in one click.",
    status: "available",
    iconColor: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    iconLabel: "@",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    title: "Phone",
    detail: "Call leads and lock in viewings.",
    status: "available",
    iconColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    iconLabel: "☎",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    title: "Listing portals",
    detail: "Post, refresh, and update listings.",
    status: "available",
    iconColor: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    iconLabel: "⊞",
    accentColor: "border-border/60",
    bgAccent: "",
  },
]

export default function ConnectPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connect</p>
        <h2 className="font-display text-3xl text-foreground">Connect the channels your clients already use</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          One setup, then everything happens inside your chat. No extra tabs.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {channels.map((channel) => {
          const isRecommended = channel.status === "recommended"
          return (
            <Card
              key={channel.title}
              className={`border bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-colors hover:bg-white/[0.07] ${channel.accentColor} ${isRecommended ? channel.bgAccent : ""}`}
            >
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${channel.iconColor}`}
                  >
                    {channel.iconLabel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{channel.title}</h3>
                      {isRecommended && (
                        <Badge
                          variant="outline"
                          className="border-[#25D366]/30 bg-[#25D366]/10 py-0 text-[10px] text-[#25D366]"
                        >
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{channel.detail}</p>
                  </div>
                </div>
                <Button
                  className="shrink-0 rounded-full"
                  size="sm"
                  variant={isRecommended ? "default" : "outline"}
                >
                  Connect
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
        <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next step</p>
              <h3 className="text-base font-semibold text-foreground">Start your first conversation</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Share a lead or listing and Lelwa will reply, follow up, and prepare the offer.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <Link href="/studio">
              Start a chat
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
