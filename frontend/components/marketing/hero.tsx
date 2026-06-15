import { ArrowRight } from "lucide-react"
import Link from "next/link"

// Entrance uses a CSS animation (not JS) so the hero is always visible —
// no blank-until-hydration flash on slow connections.
export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pt-36 pb-14 text-center">
      {/* Soft, blue-forward background glows (no green) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-14%] h-[42vw] w-[62vw] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute right-[-8%] top-[4%] h-[32vw] w-[32vw] rounded-full bg-sky-500/15 blur-[140px]" />
        <div className="absolute left-[-8%] top-[8%] h-[30vw] w-[30vw] rounded-full bg-indigo-500/15 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Centered brand mark */}
        <div className="mb-8 flex justify-center animate-[fade-up_0.7s_ease-out_both]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 shadow-[0_10px_44px_-8px_rgba(59,130,246,0.6)]">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
        </div>

        <h1
          className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.1s" }}
        >
          Every lead fully prepared
        </h1>

        <p
          className="mx-auto mb-9 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.2s" }}
        >
          Drop a lead or listing. Lelwa prepares the reply, call script, offer, contract, and follow-ups — ready to send in minutes.
        </p>

        <div
          className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/studio"
            className="rounded-full bg-blue-600 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Get started
          </Link>
          <a
            href="mailto:hello@lelwa.ai"
            className="rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Book a demo
          </a>
        </div>

        <div
          className="flex justify-center animate-[fade-up_0.7s_ease-out_both]"
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href="#work"
            className="inline-flex items-center gap-3 rounded-full border border-blue-400/20 bg-blue-500/10 px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-blue-500/15"
          >
            <span>
              <span className="font-semibold text-white">See how a lead becomes a deal</span> — reply, offer, and follow-up, prepared
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
