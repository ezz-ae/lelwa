"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUp, Loader2, MessageSquare, Plus, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const EXAMPLES = [
  "Invest AED 2M for the best 5-year ROI",
  "Buy a 2BR to live in under AED 3M",
  "Get a Golden Visa through property",
  "Build a AED 5M rental portfolio across Dubai",
]

// Plan document styling: prominent section headings, real tables, tidy lists.
const DOC =
  "text-[15px] leading-relaxed text-white/85 " +
  "[&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.18em] [&_h2]:text-blue-300/80 " +
  "[&_p]:my-2 [&_strong]:text-white [&_em]:text-white/50 " +
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 " +
  "[&_a]:text-blue-300 [&_a]:underline " +
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm " +
  "[&_th]:border-b [&_th]:border-white/15 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-white/60 " +
  "[&_td]:border-b [&_td]:border-white/[0.06] [&_td]:px-3 [&_td]:py-2 [&_td]:align-top"

const KEY = "dubay.plan"

export default function PlanPage() {
  const [goal, setGoal] = useState("")
  const [savedGoal, setSavedGoal] = useState("")
  const [plan, setPlan] = useState<string | null>(null)
  const [refine, setRefine] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null")
      if (s?.plan) {
        setPlan(s.plan)
        setSavedGoal(s.goal || "")
      }
    } catch {
      /* ignore */
    }
  }, [])

  function persist(g: string, p: string) {
    setPlan(p)
    setSavedGoal(g)
    try {
      localStorage.setItem(KEY, JSON.stringify({ goal: g, plan: p }))
    } catch {
      /* ignore */
    }
  }

  async function call(payload: Record<string, unknown>, onOk: (plan: string) => void) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Something went wrong.")
      onOk(String(data.plan || ""))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function build(g: string) {
    const goalText = g.trim()
    if (!goalText || loading) return
    call({ goal: goalText }, (p) => {
      persist(goalText, p)
      setGoal("")
    })
  }

  function applyRefine(instruction: string) {
    const r = instruction.trim()
    if (!r || loading || !plan) return
    call({ goal: savedGoal, plan, refine: r }, (p) => {
      persist(savedGoal, p)
      setRefine("")
    })
  }

  function newPlan() {
    setPlan(null)
    setSavedGoal("")
    setRefine("")
    setError(null)
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold text-white">
            D
          </span>
          <span className="text-sm font-semibold">Plan</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Chat
          </Link>
          {plan && (
            <button
              onClick={newPlan}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" /> New plan
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!plan ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 text-center">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">Build your Dubai property plan</h1>
            <p className="mt-2 text-sm text-white/50">
              Tell Dubay your goal. It drafts a strategy, areas, budget, timeline, and next steps — grounded in the market.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                build(goal)
              }}
              className="mt-7 flex w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 transition-colors focus-within:border-blue-400/50"
            >
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What's your goal? e.g. invest AED 2M for the best 5-year ROI"
                aria-label="Your goal"
                className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Build plan"
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => build(ex)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/60 transition-colors hover:border-white/25 hover:text-white"
                >
                  {ex}
                </button>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-amber-300/90">{error}</p>}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl px-6 py-8">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Your plan</p>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white">{savedGoal}</h1>
            <div className={`mt-5 ${DOC}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
            </div>
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating your plan…
              </div>
            )}
            {error && <p className="mt-4 text-sm text-amber-300/90">{error}</p>}
          </div>
        )}
      </div>

      {plan && (
        <div className="border-t border-white/10 px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyRefine(refine)
            }}
            className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 transition-colors focus-within:border-blue-400/50"
          >
            <input
              value={refine}
              onChange={(e) => setRefine(e.target.value)}
              placeholder="Refine the plan — e.g. lower risk, focus on Dubai Marina, add a 2nd unit"
              aria-label="Refine the plan"
              className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Refine"
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
