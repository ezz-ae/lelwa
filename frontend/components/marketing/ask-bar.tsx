"use client"

import { useState } from "react"
import { ArrowUp, Loader2 } from "lucide-react"

export function AskBar() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const text = question.trim()
    if (!text || loading) return
    setLoading(true)
    setError(null)
    setAnswer(null)
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Something went wrong.")
      setAnswer(data.answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-6 pb-24 pt-2">
      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 transition-colors focus-within:border-blue-400/50"
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
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

        {(answer || error) && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-sm leading-relaxed text-white/80">
            {error ? (
              <span className="text-red-300">{error}</span>
            ) : (
              <p className="whitespace-pre-wrap">{answer}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
