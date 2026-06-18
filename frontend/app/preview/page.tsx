"use client"

import { useState } from "react"
import { ArrowUp, TrendingUp } from "lucide-react"

// Representative figures — wired to live Entrestate data in production.
const AREAS = [
  { name: "Dubai Marina", price: "1,650", yield: "6.2", mom: "+4.1", spark: "0,20 12,15 24,17 36,10 48,12 60,5 72,7" },
  { name: "JVC", price: "1,150", yield: "7.8", mom: "+6.0", spark: "0,22 12,18 24,14 36,13 48,8 60,6 72,3" },
  { name: "Business Bay", price: "1,750", yield: "6.0", mom: "+3.4", spark: "0,18 12,16 24,12 36,14 48,9 60,8 72,6" },
  { name: "Downtown", price: "2,400", yield: "5.1", mom: "+2.3", spark: "0,16 12,14 24,15 36,11 48,12 60,9 72,8" },
  { name: "Dubai Hills", price: "1,900", yield: "5.6", mom: "+4.8", spark: "0,20 12,17 24,13 36,12 48,7 60,8 72,4" },
  { name: "Palm Jumeirah", price: "3,200", yield: "4.3", mom: "+5.2", spark: "0,19 12,13 24,15 36,9 48,10 60,5 72,6" },
]

export default function Preview() {
  const [q, setQ] = useState("")

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 pb-24 pt-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12%] h-[40vw] w-[60vw] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[170px]" />
        <div className="absolute right-[-8%] top-[30%] h-[26vw] w-[26vw] rounded-full bg-sky-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold">D</span>
            <span className="text-lg font-semibold">Dubay</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/45">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live market · Dubai
          </div>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">Command the Dubai market</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/55">
            Every area, priced and ranked in real time. Tell Dubay your goal — the market reorganizes around you.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3.5 transition-colors focus-within:border-blue-400/50"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="AED 2M, best 5-year ROI, near the metro…"
              className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="mt-16">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">The market, right now</p>
            <p className="text-xs text-white/35">Median sale price · net yield · 12-mo momentum</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((a) => (
              <div
                key={a.name}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-blue-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-white">{a.name}</h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                    <TrendingUp className="h-3 w-3" /> {a.mom}
                  </span>
                </div>

                <svg viewBox="0 0 72 24" className="mt-4 h-8 w-full text-blue-400" preserveAspectRatio="none">
                  <polyline points={a.spark} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/35">Median</p>
                    <p className="text-sm text-white/80">AED {a.price}<span className="text-white/40">/ft²</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-white/35">Net yield</p>
                    <p className="text-sm font-semibold text-blue-300">{a.yield}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
