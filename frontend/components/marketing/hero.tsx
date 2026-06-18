import { AskBar } from "@/components/marketing/ask-bar"

// The front door speaks to the customer: one line, the input, nothing else.
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
          Ask anything about Dubai&apos;s property market — projects, prices, ROI, the Golden Visa.
        </p>
        <AskBar />
      </div>
    </section>
  )
}
