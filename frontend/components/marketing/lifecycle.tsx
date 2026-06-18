import { Search, Sparkles, Landmark, MessagesSquare, FileText, KeyRound, Wrench } from "lucide-react"

const STAGES = [
  { icon: Search, label: "Find" },
  { icon: Sparkles, label: "Plan" },
  { icon: Landmark, label: "Finance" },
  { icon: MessagesSquare, label: "Negotiate" },
  { icon: FileText, label: "Draft" },
  { icon: KeyRound, label: "Close" },
  { icon: Wrench, label: "Manage" },
]

export function Lifecycle() {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">The whole journey</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          From the first question to the keys
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/55">
          Dubay carries a deal end to end — not a search box that hands you off.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-1 gap-y-6">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex items-center">
              <div className="flex w-[88px] flex-col items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-blue-300">
                  <stage.icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-white/70">{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && <div className="hidden h-px w-5 bg-white/12 sm:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
