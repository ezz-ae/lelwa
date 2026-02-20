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
  },
  {
    title: "Instagram",
    detail: "Answer DMs and keep every inquiry warm.",
    status: "available",
  },
  {
    title: "Facebook",
    detail: "Respond to page leads without delay.",
    status: "available",
  },
  {
    title: "Email",
    detail: "Send documents and follow-ups in one click.",
    status: "available",
  },
  {
    title: "Phone",
    detail: "Call leads and lock in viewings.",
    status: "available",
  },
  {
    title: "Listing portals",
    detail: "Post, refresh, and update listings.",
    status: "available",
  },
]

export default function ConnectPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connect</p>
        <h2 className="font-display text-3xl text-foreground">Connect the channels your clients already use</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          One setup, then everything happens inside your chat. No extra tabs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {channels.map((channel) => {
          const isRecommended = channel.status === "recommended"
          return (
            <Card key={channel.title} className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border-border/60">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{channel.title}</h3>
                    {isRecommended && (
                      <Badge variant="outline" className="bg-background/60">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{channel.detail}</p>
                </div>
                <Button className="rounded-full" variant={isRecommended ? "default" : "outline"}>
                  Connect
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border-border/60">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next step</p>
              <h3 className="text-lg font-semibold text-foreground">Start your first conversation</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Share a lead or listing and Lelwa will reply, follow up, and prepare the offer.
              </p>
            </div>
          </div>
          <Button asChild className="rounded-full">
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
