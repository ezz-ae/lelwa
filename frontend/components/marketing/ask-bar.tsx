"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp } from "lucide-react"

export function AskBar() {
  const [question, setQuestion] = useState("")
  const router = useRouter()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const text = question.trim()
    if (!text) return
    // TODO: point this at the Google Cloud Vertex AI agent endpoint.
    // For now it carries the question into the console.
    router.push(`/studio?q=${encodeURIComponent(text)}`)
  }

  return (
    <section className="px-6 pb-24 pt-2">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 transition-colors focus-within:border-blue-400/50"
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask anything about Lelwa"
          aria-label="Ask anything about Lelwa"
          className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Ask"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </section>
  )
}
