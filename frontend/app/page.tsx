"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowUpRight,
  CheckCircle2,
  Home,
  MessageSquare,
  Sparkles,
  UserCircle2,
  Zap,
  Users,
  TrendingUp,
} from "lucide-react"
import { primaryActions } from "@/lib/lelwa-actions"

const packages = [
  {
    name: "Lelwa Core",
    description: "Auto-reply, ad copy, and listing refresh for solo agents.",
    icon: Zap,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    cta: "Start with Core",
    href: "/activate",
    recommended: false,
  },
  {
    name: "Lelwa Closer",
    description: "AI calls, offer packs, and contracts — everything to close faster.",
    icon: TrendingUp,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    cta: "Start with Closer",
    href: "/activate",
    recommended: true,
  },
  {
    name: "Lelwa Team",
    description: "Multi-agent routing, activity dashboards, and unlimited leads.",
    icon: Users,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
    cta: "Contact Sales",
    href: "/activate",
    recommended: false,
  },
]

const railLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/studio", icon: MessageSquare, label: "Chat" },
  { href: "/briefing", icon: CheckCircle2, label: "Results" },
  { href: "/connect", icon: Sparkles, label: "Connect" },
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
                  <Link href="/activate">Start with Lelwa</Link>
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
                    <Link key={tile.id} href={`/activate?action=${tile.id}`} className="group">
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

              {/* Action chips row */}
              <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-2">
                {primaryActions.map((action) => (
                  <Link
                    key={action.id}
                    href={`/activate?action=${action.id}`}
                    className="rounded-full border px-4 py-2 text-xs font-medium text-foreground/80 transition hover:text-foreground"
                    style={{
                      borderColor: action.chip.border,
                      background: action.chip.background,
                    }}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>

              {/* Plans section */}
              <div className="mt-10 w-full">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Plans</p>
                <div className="grid w-full gap-3 md:grid-cols-3">
                  {packages.map((pack) => {
                    const Icon = pack.icon
                    return (
                      <Card
                        key={pack.name}
                        className={`relative border bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all hover:from-white/[0.12] ${
                          pack.recommended ? "border-violet-500/30" : "border-border/60"
                        }`}
                      >
                        {pack.recommended && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                            <span className="rounded-full border border-violet-500/40 bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                              Popular
                            </span>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${pack.iconBg}`}
                            >
                              <Icon className={`h-4 w-4 ${pack.iconColor}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{pack.description}</p>
                            </div>
                            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                          </div>
                          <div className="mt-4">
                            <Button
                              asChild
                              size="sm"
                              className="w-full rounded-full"
                              variant={pack.recommended ? "default" : "outline"}
                            >
                              <Link href={pack.href}>{pack.cta}</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
