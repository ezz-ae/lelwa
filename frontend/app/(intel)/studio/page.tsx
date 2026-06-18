"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUp, Loader2, Plus, MessageSquare, Plug, Trash2, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Msg = { role: "user" | "assistant" | "error"; content: string }
type Convo = { id: string; title: string; messages: Msg[]; updatedAt: number }

const STARTERS = [
  "Which Dubai areas give the best rental yield right now?",
  "Compare Dubai Marina and JVC for a 1-bed investment.",
  "What off-plan projects are launching this quarter?",
  "Golden Visa — what property value do I need?",
]

const MD =
  "text-sm leading-relaxed text-white/85 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-blue-300 [&_a]:underline [&_strong]:text-white [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_table]:my-2 [&_table]:w-full [&_th]:border-b [&_th]:border-white/10 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:px-2 [&_td]:py-1 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs"

const KEY = "dubay.conversations"
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const loadConvos = (): Convo[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}
const saveConvos = (c: Convo[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(c.slice(0, 50)))
  } catch {
    /* ignore quota */
  }
}

export default function Console() {
  const [convos, setConvos] = useState<Convo[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setConvos(loadConvos())
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeId, convos, loading])

  const active = convos.find((c) => c.id === activeId) || null

  const persist = useCallback((next: Convo[]) => {
    setConvos(next)
    saveConvos(next)
  }, [])

  function newChat() {
    setActiveId(null)
    setInput("")
  }

  function removeConvo(id: string) {
    const next = convos.filter((c) => c.id !== id)
    persist(next)
    if (activeId === id) setActiveId(null)
  }

  async function send(text: string) {
    const q = text.trim()
    if (!q || loading) return
    setInput("")
    setLoading(true)

    let id = activeId
    let working: Convo[]
    if (!id) {
      id = uid()
      working = [
        { id, title: q.slice(0, 48), messages: [{ role: "user", content: q }], updatedAt: Date.now() },
        ...convos,
      ]
      setActiveId(id)
    } else {
      working = convos.map((c) =>
        c.id === id ? { ...c, messages: [...c.messages, { role: "user" as const, content: q }], updatedAt: Date.now() } : c,
      )
    }
    persist(working)

    try {
      const res = await fetch("/api/console/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, session_id: id }),
      })
      const data = await res.json()
      const failed = !res.ok || data?.degraded
      const content = String(data?.reply || data?.error || "No answer.")
      persist(
        working.map((c) =>
          c.id === id
            ? { ...c, messages: [...c.messages, { role: failed ? "error" : "assistant", content }], updatedAt: Date.now() }
            : c,
        ),
      )
    } catch (err) {
      const content = err instanceof Error ? err.message : "Something went wrong."
      persist(
        working.map((c) =>
          c.id === id ? { ...c, messages: [...c.messages, { role: "error", content }], updatedAt: Date.now() } : c,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left rail — conversations */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-white/[0.02] md:flex">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold text-white">
            D
          </span>
          <span className="text-lg font-semibold">Dubay</span>
        </div>
        <div className="px-3">
          <button
            onClick={newChat}
            className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
        </div>
        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {convos.length === 0 && <p className="px-2 py-3 text-xs text-white/30">No conversations yet.</p>}
          {convos.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                c.id === activeId ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              <button onClick={() => setActiveId(c.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="truncate">{c.title}</span>
              </button>
              <button
                onClick={() => removeConvo(c.id)}
                aria-label="Delete conversation"
                className="opacity-0 transition-opacity hover:text-white group-hover:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </nav>
        <div className="space-y-0.5 border-t border-white/10 p-3">
          <Link
            href="/plan"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Sparkles className="h-4 w-4" /> Plan
          </Link>
          <Link
            href="/connect"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Plug className="h-4 w-4" /> Channels
          </Link>
        </div>
      </aside>

      {/* Main — conversation */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <p className="truncate text-sm font-medium text-white/80">{active ? active.title : "New chat"}</p>
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/5 md:hidden"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!active ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 text-center">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-xl font-bold text-white">
                D
              </span>
              <h1 className="text-2xl font-semibold tracking-tight">Ask Dubay anything about Dubai real estate</h1>
              <p className="mt-2 text-sm text-white/50">Projects, prices, ROI, areas, the Golden Visa — grounded in the market.</p>
              <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-5 px-5 py-6">
              {active.messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl bg-blue-600 px-4 py-2.5 text-sm text-white">{m.content}</p>
                  </div>
                ) : m.role === "error" ? (
                  <p key={i} className="text-sm text-amber-300/90">{m.content}</p>
                ) : (
                  <div key={i} className={MD}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
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
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 transition-colors focus-within:border-blue-400/50"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dubay about Dubai real estate"
              aria-label="Ask Dubay about Dubai real estate"
              className="flex-1 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-white/25">
            Dubay can be wrong — verify figures before acting. Powered by DXi.
          </p>
        </div>
      </main>
    </div>
  )
}
