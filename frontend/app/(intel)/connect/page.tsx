"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, Check, CheckCircle2 } from "lucide-react"
import { ConnectSheet } from "@/app/components/connect-sheet"

// ── Channel definitions ────────────────────────────────────────────────────

interface ChannelField {
  key: string
  type: "text" | "password" | "tel"
  label: string
}

interface ChannelDef {
  id: string
  title: string
  detail: string
  status: "recommended" | "available" | "coming_soon"
  iconColor: string
  iconLabel: string
  accentColor: string
  bgAccent: string
  channel?: string // backend channel key
  prompt?: string
  fields?: ChannelField[]
}

const channels: ChannelDef[] = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    detail: "Send replies and offers directly from the console.",
    status: "recommended",
    iconColor: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
    iconLabel: "W",
    accentColor: "border-[#25D366]/30",
    bgAccent: "from-[#25D366]/5",
    channel: "whatsapp",
    prompt: "Which number should send messages?",
    fields: [
      { key: "account_sid", type: "text", label: "Twilio Account SID" },
      { key: "auth_token", type: "password", label: "Twilio Auth Token" },
      { key: "from_number", type: "tel", label: "WhatsApp sender (e.g. whatsapp:+14155238886)" },
    ],
  },
  {
    id: "voice",
    title: "Voice calls",
    detail: "Call leads and lock in viewings.",
    status: "available",
    iconColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    iconLabel: "☎",
    accentColor: "border-border/60",
    bgAccent: "",
    channel: "voice",
    prompt: "Which number should place the call?",
    fields: [
      { key: "account_sid", type: "text", label: "Twilio Account SID" },
      { key: "auth_token", type: "password", label: "Twilio Auth Token" },
      { key: "from_number", type: "tel", label: "Caller number (e.g. +971XXXXXXXXX)" },
    ],
  },
  {
    id: "instagram",
    title: "Instagram",
    detail: "Answer DMs and keep every inquiry warm.",
    status: "coming_soon",
    iconColor: "bg-[#E1306C]/15 text-[#E1306C] border-[#E1306C]/20",
    iconLabel: "In",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    id: "facebook",
    title: "Facebook",
    detail: "Respond to page leads without delay.",
    status: "coming_soon",
    iconColor: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/20",
    iconLabel: "f",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    id: "email",
    title: "Email",
    detail: "Send documents and follow-ups in one click.",
    status: "coming_soon",
    iconColor: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    iconLabel: "@",
    accentColor: "border-border/60",
    bgAccent: "",
  },
  {
    id: "portals",
    title: "Listing portals",
    detail: "Post, refresh, and update listings.",
    status: "coming_soon",
    iconColor: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    iconLabel: "⊞",
    accentColor: "border-border/60",
    bgAccent: "",
  },
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [sheet, setSheet] = useState<{
    open: boolean
    channel: ChannelDef | null
  }>({ open: false, channel: null })

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

  // Load connected channels from backend on mount
  useEffect(() => {
    async function loadChannels() {
      try {
        const res = await fetch(`${apiBase}/v1/channels?user_id=default`)
        if (!res.ok) return
        const data = await res.json()
        // data is { whatsapp: { status, updated_at }, voice: { ... } }
        const ids = new Set<string>()
        for (const [key, val] of Object.entries(data)) {
          if ((val as { status: string })?.status === "connected") {
            ids.add(key)
          }
        }
        if (ids.size > 0) setConnected(ids)
      } catch {
        // Backend not reachable — keep empty state
      }
    }
    loadChannels()
  }, [apiBase])

  function openSheet(ch: ChannelDef) {
    setSheet({ open: true, channel: ch })
  }

  function handleConnected() {
    if (sheet.channel) {
      setConnected((prev) => new Set([...prev, sheet.channel!.id]))
    }
    setSheet({ open: false, channel: null })
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connect</p>
          <h2 className="font-display text-3xl text-foreground">
            Connect the channels your clients already use
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Connect once — then send, call, and follow up without leaving the console.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((ch) => {
            const isRecommended = ch.status === "recommended"
            const isComingSoon = ch.status === "coming_soon"
            const isConnected = connected.has(ch.id)
            const canConnect = !isComingSoon && !!ch.fields

            return (
              <Card
                key={ch.id}
                className={`border bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-colors hover:bg-white/[0.07] ${ch.accentColor} ${isRecommended ? ch.bgAccent : ""}`}
              >
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${ch.iconColor} ${isComingSoon ? "opacity-40" : ""}`}
                    >
                      {ch.iconLabel}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${isComingSoon ? "text-muted-foreground" : "text-foreground"}`}>
                          {ch.title}
                        </h3>
                        {isRecommended && !isConnected && (
                          <Badge
                            variant="outline"
                            className="border-[#25D366]/30 bg-[#25D366]/10 py-0 text-[10px] text-[#25D366]"
                          >
                            Recommended
                          </Badge>
                        )}
                        {isConnected && (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 py-0 text-[10px] text-emerald-400"
                          >
                            Connected
                          </Badge>
                        )}
                        {isComingSoon && (
                          <Badge variant="outline" className="py-0 text-[10px] text-muted-foreground/60">
                            Coming soon
                          </Badge>
                        )}
                      </div>
                      <p className={`mt-0.5 text-xs ${isComingSoon ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                        {ch.detail}
                      </p>
                    </div>
                  </div>

                  {isConnected ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  ) : canConnect ? (
                    <Button
                      className="shrink-0 rounded-full"
                      size="sm"
                      variant={isRecommended ? "default" : "outline"}
                      onClick={() => openSheet(ch)}
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button
                      className="shrink-0 rounded-full opacity-40"
                      size="sm"
                      variant="outline"
                      disabled
                    >
                      Soon
                    </Button>
                  )}
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
                <h3 className="text-base font-semibold text-foreground">
                  Start your first conversation
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share a lead or listing. Lelwa prepares the reply, call script, and offer.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 rounded-full">
              <Link href="/studio">
                Open console
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConnectSheet
        isOpen={sheet.open}
        channel={sheet.channel?.channel ?? ""}
        prompt={sheet.channel?.prompt ?? "Connect your account."}
        fields={sheet.channel?.fields ?? []}
        onClose={() => setSheet({ open: false, channel: null })}
        onConnected={handleConnected}
      />
    </>
  )
}
