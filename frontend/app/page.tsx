"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowUpRight,
  CircleDot,
  Layers,
  LineChart,
  MapPin,
  Menu,
  Shield,
  Sparkles,
  X,
} from "lucide-react"

const words = ["districts", "launches", "assets", "signals", "yields"]

const metrics = [
  { label: "Projects scored", value: "7,015", detail: "Neon-ranked inventory" },
  { label: "Signals tracked", value: "24", detail: "Demand, supply, timing" },
  { label: "Avg gross yield", value: "6.4%", detail: "Prime Dubai 2025" },
  { label: "Investor profiles", value: "18", detail: "Risk bands mapped" },
]

const signalHighlights = [
  {
    title: "Pulse Index",
    detail: "Live demand + launch velocity",
    icon: LineChart,
  },
  {
    title: "Deal DNA",
    detail: "Safety bands + price reality",
    icon: Layers,
  },
  {
    title: "Risk Shield",
    detail: "Filter speculative exposure",
    icon: Shield,
  },
]

const zoneGrid = [
  "Dubai Marina",
  "Business Bay",
  "Creek Harbour",
  "Palm Jumeirah",
  "JVC",
  "Downtown",
]

export default function MarketingLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false)
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length)
        setWordVisible(true)
      }, 250)
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0C0F] text-[#F4F4F5]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.35),_transparent_65%)] blur-3xl" />
          <div className="absolute -bottom-48 right-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.28),_transparent_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.4),_rgba(15,23,42,0))]" />
        </div>

        <header className="relative z-10 px-6 md:px-12 pt-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B0C0F]/80 px-5 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-5 w-5 text-teal-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Lelwa</p>
                <p className="font-display text-sm text-white">Real Estate Intelligence</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
              <Link href="/pulse" className="hover:text-white transition">Pulse</Link>
              <Link href="/signals" className="hover:text-white transition">Signals</Link>
              <Link href="/studio" className="hover:text-white transition">Studio</Link>
              <Link href="/intake" className="hover:text-white transition">Intake</Link>
              <Link href="/briefing" className="hover:text-white transition">Briefing</Link>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="outline" className="rounded-full border-white/20 text-white">
                <Link href="/studio">Enter studio</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/briefing">
                  Book briefing
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden text-white"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {menuOpen && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B0C0F]/90 px-5 py-4 text-sm text-white/70 md:hidden">
              <div className="flex flex-col gap-3">
                <Link href="/pulse" onClick={() => setMenuOpen(false)}>
                  Pulse
                </Link>
                <Link href="/signals" onClick={() => setMenuOpen(false)}>
                  Signals
                </Link>
                <Link href="/studio" onClick={() => setMenuOpen(false)}>
                  Studio
                </Link>
                <Link href="/intake" onClick={() => setMenuOpen(false)}>
                  Intake
                </Link>
                <Link href="/briefing" onClick={() => setMenuOpen(false)}>
                  Briefing
                </Link>
              </div>
            </div>
          )}
        </header>

        <section className="relative z-10 px-6 md:px-12 pt-16 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-white border-white/10">Dubai / UAE</Badge>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  Live signal stack
                </Badge>
              </div>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">
                Predict the best
                <span
                  className={`ml-2 inline-block text-teal-300 transition-opacity duration-300 ${
                    wordVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {words[wordIndex]}
                </span>
                <span className="ml-2">before the market moves.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-xl">
                Lelwa turns real estate data into actionable strategy. Track demand surges, price
                reality, and investor fit in one intelligence layer built for Dubai.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/studio">Enter live studio</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/20 text-white">
                  <Link href="/pulse">View market pulse</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                {metrics.slice(0, 2).map((metric) => (
                  <div key={metric.label}>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">{metric.label}</p>
                    <p className="text-2xl font-semibold text-white">{metric.value}</p>
                    <p className="text-xs text-white/50">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 shadow-2xl shadow-teal-500/10">
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
                    <CircleDot className="h-3 w-3 text-emerald-400" />
                    Live pulse
                  </div>
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    Updated 2 min ago
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">{metric.label}</p>
                      <p className="text-2xl font-semibold text-white mt-2">{metric.value}</p>
                      <p className="text-xs text-white/50 mt-1">{metric.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium text-white">Momentum leaders</p>
                  <div className="mt-3 grid gap-2 text-sm">
                    {zoneGrid.map((zone) => (
                      <div key={zone} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-white/80">
                          <MapPin className="h-4 w-4" />
                          {zone}
                        </span>
                        <span className="text-teal-300">+3.2%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <section className="px-6 md:px-12 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {signalHighlights.map((highlight) => {
            const Icon = highlight.icon
            return (
              <Card key={highlight.title} className="bg-white/5 border-white/10">
                <CardContent className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
                    <p className="text-sm text-white/60 mt-1">{highlight.detail}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-20">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Coverage map</p>
              <h2 className="font-display text-3xl text-white mt-3">Signal coverage across Dubai neighborhoods.</h2>
              <p className="text-sm text-white/60 mt-3 max-w-xl">
                Track hypergrowth areas, pricing anomalies, and investor-fit zones with one shared view.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/signals">Explore signals</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {zoneGrid.map((zone) => (
              <div key={zone} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-medium text-white">{zone}</p>
                <p className="text-xs text-white/50 mt-2">Live demand index active</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-teal-500/10 via-transparent to-orange-500/10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Ready to move</p>
              <h3 className="font-display text-3xl text-white mt-2">Book a market briefing built for your portfolio.</h3>
              <p className="text-sm text-white/60 mt-3 max-w-xl">
                Lelwa blends DLD transactions, developer reliability, and live demand into a single action plan.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/briefing">
                Request briefing
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
