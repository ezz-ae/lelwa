"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Turn = { role: "user" | "assistant" | "error"; content: string }

const DEFAULT_SUGGESTIONS = [
  "Best ROI areas for a 2BR under AED 2M?",
  "Which off-plan projects launch this quarter?",
  "Do I qualify for the Golden Visa?",
  "Fair price for a 1BR in JVC?",
]

const MD = "text-sm leading-relaxed text-white/85 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-blue-300 [&_a]:underline [&_strong]:text-white [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs"

export function AskBar({ suggestions = DEFAULT_SUGGESTIONS }: { suggestions?: string[] }) {
  const [question, setQuestion] = useState("")
  const [turns, setTurns] = useState<Turn[]>([])
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [turns, loading])

  async function ask(text: string) {
    const q = text.trim()
    if (!q || loading) return
    setQuestion("")
    setTurns((t) => [...t, { role: "user", content: q }])
    setLoading(true)
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Something went wrong.")
      setTurns((t) => [...t, { role: "assistant", content: String(data.answer || "") }])
    } catch (err) {
      setTurns((t) => [
        ...t,
        { role: "error", content: err instanceof Error ? err.message : "Something went wrong." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const started = turns.length > 0

  return (
    <div className="mx-auto w-full max-w-2xl text-left">
      {started && (
        <div className="mb-3 max-h-[44vh] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {turns.map((turn, i) =>
            turn.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl bg-blue-600 px-4 py-2 text-sm text-white">{turn.content}</p>
              </div>
            ) : turn.role === "error" ? (
              <p key={i} className="text-sm text-red-300">{turn.content}</p>
            ) : (
              <div key={i} className={MD}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{turn.content}</ReactMarkdown>
              </div>
            ),
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Dubay is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(question)
        }}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 transition-colors focus-within:border-blue-400/50"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about Dubai real estate"
          aria-label="Ask anything about Dubai real estate"
          className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Ask"
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </form>

      {!started && suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/60 transition-colors hover:border-white/25 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
