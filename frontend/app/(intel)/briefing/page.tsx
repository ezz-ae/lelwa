"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  Megaphone,
  MessageSquare,
  Plug,
  Sparkles,
} from "lucide-react"

const deliverables = [
  {
    title: "Lead replies + follow-ups",
    detail: "Prepared replies across WhatsApp, voice, and email.",
    icon: MessageSquare,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    dot: "bg-teal-400",
  },
  {
    title: "Ads + listings",
    detail: "Headlines, copy, and creative assets — prepared for publication.",
    icon: Megaphone,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  {
    title: "Offers + contracts",
    detail: "Terms, pricing, and documentation — ready to submit.",
    icon: FileText,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "bg-rose-400",
  },
]

interface ChannelStatus {
  [key: string]: { status: string; updated_at: string }
}

export default function BriefingPage() {
  const [connectedChannels, setConnectedChannels] = useState<string[]>([])
  const [hasSession, setHasSession] = useState(false)

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

  useEffect(() => {
    const sessionId = window.localStorage.getItem("lelwa_session_id")
    setHasSession(Boolean(sessionId))

    async function loadChannels() {
      try {
        const res = await fetch(`${apiBase}/v1/channels?user_id=default`)
        if (!res.ok) return
        const data: ChannelStatus = await res.json()
        const connected: string[] = []
        for (const [key, val] of Object.entries(data)) {
          if (val?.status === "connected") connected.push(key)
        }
        setConnectedChannels(connected)
      } catch {
        // Backend not reachable
      }
    }
    loadChannels()
  }, [apiBase])

  const readyCount = connectedChannels.length
  const channelNames: Record<string, string> = {
    whatsapp: "WhatsApp",
    voice: "Voice",
    instagram: "Instagram",
    facebook: "Facebook",
    email: "Email",
    portals: "Listing Portals",
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Results</p>
        <h2 className="font-display text-3xl text-foreground">Prepared outputs, ready to execute</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          No context switching. Every prepared item is ready to send, call, or submit.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Deliverables card */}
        <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Deliverables</p>
                <h3 className="text-lg font-semibold text-foreground">Outputs per console session</h3>
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
                    <span className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.color} ${item.border} ${item.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                      Included
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Readiness card */}
        <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
          <CardContent className="space-y-5 pt-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
              <h3 className="text-lg font-semibold text-foreground">Console readiness</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Complete the steps below to activate full operations.
              </p>
            </div>
            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start gap-3">
                  {hasSession
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    : <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                  }
                  <div>
                    <p className="text-sm font-medium text-foreground">First session</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {hasSession ? "Session active. Outputs are being prepared." : "Submit a lead or listing in the console."}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${hasSession ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-border/40 bg-muted/30 text-muted-foreground/60"}`}>
                  {hasSession ? "Active" : "Pending"}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start gap-3">
                  {readyCount > 0
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    : <Plug className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                  }
                  <div>
                    <p className="text-sm font-medium text-foreground">Channels configured</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {readyCount > 0
                        ? connectedChannels.map((c) => channelNames[c] ?? c).join(", ")
                        : "Configure at least one channel under Connect."}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${readyCount > 0 ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-border/40 bg-muted/30 text-muted-foreground/60"}`}>
                  {readyCount > 0 ? `${readyCount} active` : "Pending"}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start gap-3">
                  {hasSession && readyCount > 0
                    ? <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    : <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                  }
                  <div>
                    <p className="text-sm font-medium text-foreground">Ready to execute</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {hasSession && readyCount > 0
                        ? "Console active. Send offers, place calls, close deals."
                        : "Complete the steps above to activate full operations."}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${hasSession && readyCount > 0 ? "border-amber-500/25 bg-amber-500/10 text-amber-400" : "border-border/40 bg-muted/30 text-muted-foreground/60"}`}>
                  {hasSession && readyCount > 0 ? "Ready" : "Pending"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Button asChild className="rounded-full">
                <Link href="/studio">
                  {hasSession ? "Continue session" : "Open console"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              {readyCount === 0 && (
                <Button asChild variant="outline" className="rounded-full border-border/60">
                  <Link href="/connect">Configure channels</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
