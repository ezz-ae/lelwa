"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Home,
  MessageSquare,
  Plug,
  Sparkles,
  UserCircle2,
} from "lucide-react"
import { primaryActions } from "@/lib/lelwa-actions"
import { WidgetCards } from "./components/widget-cards"

const railLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/studio", icon: MessageSquare, label: "Chat" },
  { href: "/briefing", icon: CheckCircle2, label: "Results" },
  { href: "/connect", icon: Plug, label: "Connect" },
]

export default function MarketingLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[88px_1fr]">
        {/* Left rail */}
        <aside className="hidden h-full flex-col items-center gap-6 border-r border-sidebar-border bg-sidebar py-6 md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <nav className="flex flex-1 flex-col items-center gap-3">
            {railLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                  aria-label={link.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </nav>
          <Link
            href="/login"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            aria-label="Log in"
          >
            <UserCircle2 className="h-5 w-5" />
          </Link>
        </aside>

        {/* Main content */}
        <main className="px-5 py-6 md:px-10">
          <div className="relative h-full min-h-[92vh] rounded-[36px] border border-border/60 bg-gradient-to-br from-[#1A1B20] via-[#13151B] to-[#0D0F14] p-6 shadow-2xl shadow-black/40 md:p-10">
            <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)]" />

            {/* Header */}
            <header className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60">
                  <Sparkles className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lelwa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-muted/40">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/studio">Open Console</Link>
                </Button>
              </div>
            </header>

            {/* Hero section */}
            <section className="relative z-10 mt-10 flex flex-col items-center text-center">
              <h1 className="font-display text-3xl md:text-4xl text-foreground">How would you like to start?</h1>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Pick an action and Lelwa sets up your workspace instantly.
              </p>

              {/* Action tiles */}
              <div className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                {primaryActions.map((tile) => {
                  const Icon = tile.icon
                  return (
                    <Link key={tile.id} href={`/studio?action=${tile.id}`} className="group">
                      <div
                        className="h-full rounded-[28px] p-[1px]"
                        style={{
                          background: `linear-gradient(135deg, ${tile.stroke[0]}, ${tile.stroke[1]})`,
                        }}
                      >
                        <Card
                          className="h-full border-0 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.7)] transition-transform duration-200 group-hover:-translate-y-1"
                          style={{
                            background: `linear-gradient(140deg, ${tile.glow[0]}, rgba(15, 17, 22, 0.96) 65%), linear-gradient(160deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))`,
                          }}
                        >
                          <CardContent className="flex h-full flex-col items-start gap-6 p-4">
                            <div
                              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5"
                              style={{ background: tile.iconBackground }}
                            >
                              <Icon className={`h-6 w-6 ${tile.iconClass}`} />
                            </div>
                            <p className="text-sm font-semibold text-foreground">{tile.label}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Widget cards row */}
            <section className="relative z-10 mt-10">
              <WidgetCards />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
