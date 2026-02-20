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
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Channels</p>
          <h2 className="font-display text-3xl text-foreground">Configure outreach channels</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Credentials are stored once. All outreach — messages, calls, listings — executes from the console.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {CHANNELS.map((ch) => {
            const isConnected = connected.has(ch.id)

            return (
              <Card
                key={ch.id}
                className={`border bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-colors hover:bg-white/[0.07] ${ch.accentColor} ${ch.isRecommended ? ch.bgAccent : ""}`}
              >
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${ch.iconColor}`}>
                      {ch.iconLabel}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{ch.title}</h3>
                        {isConnected && (
                          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 py-0 text-[10px] text-emerald-400">
                            Connected
                          </Badge>
                        )}
                        {!isConnected && ch.isRecommended && (
                          <Badge variant="outline" className="border-[#25D366]/30 bg-[#25D366]/10 py-0 text-[10px] text-[#25D366]">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ch.detail}</p>
                    </div>
                  </div>

                  {isConnected ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  ) : (
                    <Button
                      className="shrink-0 rounded-full"
                      size="sm"
                      variant={ch.isRecommended ? "default" : "outline"}
                      onClick={() => setSheet({ open: true, channel: ch })}
                    >
                      Connect
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
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next</p>
                <h3 className="text-base font-semibold text-foreground">Open the console</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submit a lead or property reference. Lelwa returns the reply, call script, and offer documentation.
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
