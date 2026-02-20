"use client"

import { useEffect, useState } from "react"
import { Cloud, TrendingUp } from "lucide-react"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function WidgetCards() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()
  const dayName = DAY_NAMES[time.getDay()]

  const secondAngle = (seconds / 60) * 360
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
      {/* Clock Widget */}
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-black/10">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative h-36 w-36">
            <svg className="h-full w-full" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/30"
              />
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180)
                const isMain = i % 3 === 0
                const outer = isMain ? 88 : 90
                const inner = isMain ? 76 : 83
                const x1 = 100 + Math.cos(angle) * outer
                const y1 = 100 + Math.sin(angle) * outer
                const x2 = 100 + Math.cos(angle) * inner
                const y2 = 100 + Math.sin(angle) * inner
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth={isMain ? "3" : "1.5"}
                    strokeLinecap="round"
                    className={isMain ? "text-foreground/40" : "text-foreground/20"}
                  />
                )
              })}
              <line
                x1="100"
                y1="100"
                x2={100 + Math.cos((hourAngle - 90) * (Math.PI / 180)) * 46}
                y2={100 + Math.sin((hourAngle - 90) * (Math.PI / 180)) * 46}
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-foreground"
              />
              <line
                x1="100"
                y1="100"
                x2={100 + Math.cos((minuteAngle - 90) * (Math.PI / 180)) * 62}
                y2={100 + Math.sin((minuteAngle - 90) * (Math.PI / 180)) * 62}
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-foreground"
              />
              <line
                x1={100 - Math.cos((secondAngle - 90) * (Math.PI / 180)) * 16}
                y1={100 - Math.sin((secondAngle - 90) * (Math.PI / 180)) * 16}
                x2={100 + Math.cos((secondAngle - 90) * (Math.PI / 180)) * 72}
                y2={100 + Math.sin((secondAngle - 90) * (Math.PI / 180)) * 72}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-orange-500"
              />
              <circle cx="100" cy="100" r="5" fill="currentColor" className="text-foreground" />
              <circle cx="100" cy="100" r="2.5" fill="currentColor" className="text-orange-500" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-base font-medium text-foreground">Dubai</div>
            <div className="text-xs text-muted-foreground">
              {dayName} ·{" "}
              {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Yield Widget */}
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-black/10">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold text-foreground">Yield Index</div>
              <div className="text-xs text-muted-foreground">Dubai Marina</div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              1.4%
            </div>
          </div>

          <div className="h-16">
            <svg className="h-full w-full" viewBox="0 0 300 64" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(14, 165, 233)" />
                  <stop offset="65%" stopColor="rgb(14, 165, 233)" />
                  <stop offset="65%" stopColor="rgb(239, 68, 68)" />
                  <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,48 20,44 40,46 60,40 80,36 100,32 120,28 140,24 160,16 180,12 200,20 220,28 240,40 260,48 280,52 300,56 L300,64 L0,64 Z"
                fill="url(#areaGrad)"
              />
              <polyline
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeLinejoin="round"
                points="0,48 20,44 40,46 60,40 80,36 100,32 120,28 140,24 160,16 180,12 200,20 220,28 240,40 260,48 280,52 300,56"
              />
            </svg>
          </div>

          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold text-foreground">6.8%</div>
            <div className="text-[11px] text-muted-foreground/60">avg gross yield</div>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-black/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8 text-white">
          <div className="flex items-start justify-between">
            <div className="text-5xl font-light tracking-tight">21°</div>
            <Cloud className="h-11 w-11 opacity-80" />
          </div>

          <div>
            <div className="text-sm font-medium opacity-90">Partly cloudy</div>
            <div className="mt-1 text-[11px] leading-snug opacity-60">
              Nadd Al Shiba
              <br />
              United Arab Emirates
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
