"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppShell } from "@/app/components/app-shell"
import {
  primaryActions,
  capabilityCards,
  type ActionId,
} from "@/lib/lelwa-actions"

export default function MarketingLanding() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const preview = searchParams.get("preview") === "1"

  useEffect(() => {
    const existingUser = window.localStorage.getItem("lelwa_user_id")
    if (existingUser && !preview) {
      router.replace("/studio")
    }
  }, [router, preview])

  function ensureUser() {
    const existing = window.localStorage.getItem("lelwa_user_id")
    if (!existing) {
      window.localStorage.setItem("lelwa_user_id", `user_${crypto.randomUUID()}`)
    }
  }

  function startSession(actionId?: ActionId, prompt?: string) {
    ensureUser()
    const params = new URLSearchParams()
    if (actionId) params.set("action", actionId)
    if (prompt) params.set("prompt", prompt)
    const qs = params.toString()
    router.push(qs ? `/studio?${qs}` : "/studio")
  }

  function handleSearchSubmit() {
    const trimmed = query.trim()
    if (!trimmed) {
      startSession()
      return
    }
    startSession(undefined, trimmed)
  }

  return (
    <AppShell mainClassName="px-6 pb-16 pt-8 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/80 p-8 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),transparent_50%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.08),transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),transparent_45%)]" />
          <div className="relative flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Lelwa home</p>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                How would you like to start?
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
                Prepared reply, call script, offers, and follow-up plans are ready the moment you start.
              </p>
            </div>

            <div className="flex w-full max-w-2xl items-center gap-3 rounded-full border border-border/70 bg-white px-4 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearchSubmit()
                  }
                }}
                placeholder="Search leads, listings, or requests"
                className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <Button type="button" className="rounded-full" onClick={handleSearchSubmit}>
                Start
              </Button>
            </div>

            <div className="mt-2 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {primaryActions.map((tile) => {
                const Icon = tile.icon
                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => startSession(tile.id)}
                    className="group text-left"
                  >
                    <div
                      className="h-full rounded-[26px] p-[1px]"
                      style={{
                        background: `linear-gradient(135deg, ${tile.stroke[0]}, ${tile.stroke[1]})`,
                      }}
                    >
                      <Card
                        className="h-full border-0 bg-white/90 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.6)] transition-transform duration-200 group-hover:-translate-y-1"
                      >
                        <CardContent className="flex h-full flex-col items-start gap-6 p-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40"
                            style={{ background: tile.iconBackground }}
                          >
                            <Icon className={`h-5 w-5 ${tile.iconClass}`} />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{tile.label}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Capabilities</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">What Lelwa can do</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilityCards.map((card) => (
              <Card key={card.title} className="border-border/70 bg-white/80 shadow-sm">
                <CardContent className="space-y-2 py-5">
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
