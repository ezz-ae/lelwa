"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, Check, CheckCircle2 } from "lucide-react"
import { ConnectSheet } from "@/app/components/connect-sheet"
import { CHANNELS, type ChannelDef } from "@/lib/channel-config"

export default function ConnectPage() {
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [sheet, setSheet] = useState<{
    open: boolean
    channel: ChannelDef | null
  }>({ open: false, channel: null })

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

  useEffect(() => {
    async function loadChannels() {
      try {
        const res = await fetch(`${apiBase}/v1/channels?user_id=default`)
        if (!res.ok) return
        const data = await res.json()
        const ids = new Set<string>()
        for (const [key, val] of Object.entries(data)) {
          if ((val as { status: string })?.status === "connected") ids.add(key)
        }
        if (ids.size > 0) setConnected(ids)
      } catch {
        // Backend not reachable — keep empty state
      }
    }
    loadChannels()
  }, [apiBase])

  function handleConnected() {
    if (sheet.channel) {
      setConnected((prev) => new Set([...prev, sheet.channel!.id]))
    }
    setSheet({ open: false, channel: null })
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Channels</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Connect your channels</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Connect WhatsApp, voice, and more once — credentials are encrypted and never shared.
            </p>
          </div>
          <Link
            href="/studio"
            className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/5"
          >
            ← Back to Dubay
          </Link>
        </header>

        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="grid gap-3 md:grid-cols-2">
            {CHANNELS.map((ch) => {
              const isConnected = connected.has(ch.id)
              const isUnavailable = ch.status === "unavailable"
              const canConnect = !isUnavailable && ch.fields.length > 0
              const statusLabel = isConnected ? "Done" : isUnavailable ? "Unavailable" : "Not connected"

              return (
                <Card
                  key={ch.id}
                  className={`border border-white/10 bg-white/5 transition-colors hover:bg-white/10 ${ch.accentColor} ${ch.bgAccent}`}
                >
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-sm font-bold ${ch.iconColor} ${isUnavailable ? "opacity-40" : ""}`}>
                        {ch.iconLabel}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{ch.title}</h3>
                          <Badge
                            variant="outline"
                            className={`py-0 text-[10px] ${
                              isConnected
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                                : isUnavailable
                                  ? "text-muted-foreground/60"
                                  : "border-white/10 text-muted-foreground"
                            }`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                        <p className={`mt-0.5 text-xs ${isUnavailable ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                          {ch.detail}
                        </p>
                      </div>
                    </div>

                    {isConnected ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
                        <Check className="h-3.5 w-3.5 text-blue-200" />
                      </div>
                    ) : canConnect ? (
                      <Button
                        className="shrink-0 rounded-full border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                        size="sm"
                        variant="outline"
                        onClick={() => setSheet({ open: true, channel: ch })}
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
                        Unavailable
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="border border-white/10 bg-white/5">
            <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next</p>
                  <h3 className="text-base font-semibold text-foreground">Back to Dubay</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask Dubay about the market — prepared messages send on your connected channels.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0 rounded-full border-white/10 bg-white/5 text-foreground hover:bg-white/10" variant="outline">
                <Link href="/studio">
                  Open Dubay
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConnectSheet
        isOpen={sheet.open}
        channel={sheet.channel?.channel ?? ""}
        prompt={sheet.channel?.prompt ?? "Not connected."}
        fields={sheet.channel?.fields ?? []}
        onClose={() => setSheet({ open: false, channel: null })}
        onConnected={handleConnected}
      />
    </>
  )
}
