import { Home, Briefcase, KeyRound, Building2, Megaphone, Landmark } from "lucide-react"

const AUDIENCES = [
  { icon: Briefcase, title: "Investors", line: "Find yield, model ROI, build a portfolio." },
  { icon: Home, title: "Buyers", line: "Find the right home and close with confidence." },
  { icon: KeyRound, title: "Renters", line: "Search, apply, and sign — without the runaround." },
  { icon: Building2, title: "Realtors & developers", line: "Reach the right buyer; sell and launch faster." },
  { icon: Megaphone, title: "Advertisers", line: "Run campaigns on your own accounts, measured." },
  { icon: Landmark, title: "Regulators", line: "Transparent, compliant transactions by design." },
]

export function Audiences() {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">For every side</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            One portal. Every side of the market.
          </h2>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-medium text-white">{a.title}</h3>
              <p className="mt-1 text-sm text-white/55">{a.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
