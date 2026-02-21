"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, CheckCircle2, Circle, Plug } from "lucide-react"

const CHANNEL_NAMES: Record<string, string> = {
  whatsapp: "WhatsApp",
  voice: "Voice calls",
  instagram: "Instagram",
  facebook: "Facebook",
  email: "Email",
  portals: "Listing portals",
}

interface CheckItem {
  label: string
  done: boolean
}

export default function BriefingPage() {
  const [checks, setChecks] = useState<CheckItem[]>([
    { label: "First session started", done: false },
    { label: "Channels configured", done: false },
    { label: "Ready to execute", done: false },
  ])

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

  useEffect(() => {
    const hasSession = !!window.localStorage.getItem("lelwa_session_id")

    async function loadChannels() {
      try {
        const res = await fetch(`${apiBase}/v1/channels?user_id=default`)
        if (!res.ok) return { connected: false, names: [] as string[] }
        const data = await res.json()
        const names: string[] = []
        for (const [key, val] of Object.entries(data)) {
          if ((val as { status: string })?.status === "connected") {
            names.push(CHANNEL_NAMES[key] ?? key)
          }
        }
        return { connected: names.length > 0, names }
      } catch {
        return { connected: false, names: [] as string[] }
      }
    }

    loadChannels().then(({ connected }) => {
      const allDone = hasSession && connected
      setChecks([
        { label: "First session started", done: hasSession },
        { label: "Channels configured", done: connected },
        { label: "Ready to execute", done: allDone },
      ])
    })
  }, [apiBase])

  const allReady = checks.every((c) => c.done)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prepared</p>
        <h2 className="font-display text-3xl text-foreground">Results</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Prepared outputs, ready for review.
        </p>
      </div>

      {/* Deliverables */}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            label: "Replies & follow-ups",
            detail: "Lead replies and timed follow-up sequences, drafted and queued.",
          },
          {
            label: "Ads & listings",
            detail: "Property listings and ad copy prepared for portal submission.",
          },
          {
            label: "Offers & contracts",
            detail: "Offer sheets and contract templates prepared for review.",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <CardContent className="py-5">
              <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Readiness checklist */}
      <Card className="border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <CardContent className="py-5">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Readiness</p>
          <ul className="space-y-3">
            {checks.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground/60"}`}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="shrink-0 rounded-full">
          <Link href="/studio">
            {allReady ? "Continue session" : "Open console"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        {!checks[1].done && (
          <Button asChild variant="outline" className="shrink-0 rounded-full">
            <Link href="/connect">
              <Plug className="h-4 w-4" />
              Configure channels
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
