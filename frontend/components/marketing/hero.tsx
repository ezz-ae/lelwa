import Link from "next/link"
import { AskBar } from "@/components/marketing/ask-bar"
import { BRAND } from "@/lib/brand"

// The market-AI front door: ask Dubay anything about Dubai real estate.
// Entrance uses CSS animation so the hero is always visible (no hydration flash).
export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pt-36 pb-20 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-14%] h-[42vw] w-[62vw] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute right-[-8%] top-[4%] h-[32vw] w-[32vw] rounded-full bg-sky-500/15 blur-[140px]" />
        <div className="absolute left-[-8%] top-[8%] h-[30vw] w-[30vw] rounded-full bg-indigo-500/15 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="mb-8 flex justify-center animate-[fade-up_0.7s_ease-out_both]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-[0_10px_44px_-8px_rgba(59,130,246,0.6)]">
            <span className="text-2xl font-bold text-white">D</span>
          </div>
        </div>

        <h1
          className="mb-5 text-5xl font-bold tracking-tight text-white md:text-7xl animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.1s" }}
        >
          The AI of Dubai real estate
        </h1>

        <p
          className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.2s" }}
        >
          Ask {BRAND.name} anything — projects, prices, ROI, Golden Visa. Answers built on
          Entrestate&apos;s data: 3,500 Dubai projects and live market benchmarks.
        </p>

        <div className="animate-[fade-up_0.7s_ease-out_both]" style={{ animationDelay: "0.3s" }}>
          <AskBar />
        </div>

        <div
          className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.5s" }}
        >
          <Link
            href="/studio"
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            For brokers &amp; agencies
          </Link>
          <a
            href={`mailto:${BRAND.email}`}
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Talk to us
          </a>
        </div>
      </div>
    </section>
  )
}
