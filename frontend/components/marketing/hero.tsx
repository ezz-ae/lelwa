import { AskBar } from "@/components/marketing/ask-bar"

// The front door: one line, the input, nothing else. Ask-first, instantly visible.
export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[4%] h-[38vw] w-[56vw] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[170px]" />
        <div className="absolute right-[-6%] top-[20%] h-[24vw] w-[24vw] rounded-full bg-sky-500/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <h1 className="mb-5 text-balance text-5xl font-semibold tracking-tight text-white md:text-6xl">
          The AI of Dubai real estate
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/55">
          Ask anything — then find, plan, finance, negotiate, and close it. The whole journey, one place.
        </p>
        <AskBar />
        <p className="mt-6 text-xs text-white/30">
          For buyers, investors, renters — and the realtors, developers, and advertisers who serve them.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-white/25">
        Scroll
      </div>
    </section>
  )
}
