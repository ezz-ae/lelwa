"use client"

import { useState } from "react"
import { ArrowUp, TrendingUp } from "lucide-react"
import type { MarketBoard } from "@/lib/market-context"

function aedCompact(n: number | null): string {
  if (n == null) return "—"
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`
  return `AED ${Math.round(n)}`
}
const pct = (n: number | null, sign = false) =>
  n == null ? "—" : `${sign && n > 0 ? "+" : ""}${n.toFixed(1)}%`

export function MarketTerminal({ board }: { board: MarketBoard }) {
  const [q, setQ] = useState("")
  const rows = board.rows
  const maxYield = Math.max(...rows.map((r) => r.yield ?? 0), 1)
  const avgYield = rows.length ? rows.reduce((s, r) => s + (r.yield ?? 0), 0) / rows.length : 0
  const topMomentum = rows.reduce((m, r) => Math.max(m, r.yoy ?? 0), 0)
  const ticker = [...rows, ...rows]

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 pb-24 pt-8 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12%] h-[36vw] w-[56vw] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[170px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold">D</span>
            <span className="text-lg font-semibold">Dubay</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/45">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {board.live ? "Live · updates hourly" : "Sample data · updates hourly when connected"}
          </div>
        </div>

        {/* live ticker */}
        <div className="mt-6 overflow-hidden rounded-full border border-white/10 bg-white/[0.02] py-2">
          <div className="flex w-max gap-8 whitespace-nowrap pl-8" style={{ animation: "marquee 40s linear infinite" }}>
            {ticker.map((r, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-white/55">
                <span className="text-white/80">{r.area}</span>
                <span className="text-blue-300">{pct(r.yield)}</span>
                <span className="text-emerald-300">▲ {pct(r.yoy)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* headline + command */}
        <div className="mx-auto mt-14 max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">Command the Dubai market</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/55">
            The whole market, live and ranked. Tell Dubay your goal — it reorganizes around you.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3.5 transition-colors focus-within:border-blue-400/50"
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

        {/* index stats */}
        <div className="mt-14 grid grid-cols-3 gap-3">
          {[
            { label: "Projects tracked", value: board.total ? board.total.toLocaleString("en-US") : "3,500+" },
            { label: "Avg net yield", value: `${avgYield.toFixed(1)}%` },
            { label: "Top momentum", value: `+${topMomentum.toFixed(1)}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-white/40">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* the board — ranked, not cards */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[28px_1.6fr_1fr_minmax(120px,1.4fr)_72px] items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] uppercase tracking-wider text-white/40">
            <span>#</span>
            <span>Area</span>
            <span className="text-right">Median</span>
            <span>Net yield</span>
            <span className="text-right">12-mo</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.area}
              className="grid grid-cols-[28px_1.6fr_1fr_minmax(120px,1.4fr)_72px] items-center gap-3 border-b border-white/[0.06] px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.03]"
            >
              <span className="text-sm text-white/35">{i + 1}</span>
              <span className="truncate text-sm font-medium text-white">{r.area}</span>
              <span className="text-right text-sm text-white/75">{aedCompact(r.price)}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400"
                    style={{ width: `${Math.round(((r.yield ?? 0) / maxYield) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-blue-300">{pct(r.yield)}</span>
              </div>
              <span className="flex items-center justify-end gap-1 text-sm text-emerald-300">
                <TrendingUp className="h-3 w-3" /> {pct(r.yoy)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
