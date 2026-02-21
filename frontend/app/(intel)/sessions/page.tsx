"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { listSessions, type SessionSummary } from "@/lib/session-store"

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function SessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    setSessions(listSessions())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      (s.lastMessage ?? "").toLowerCase().includes(q) ||
      (s.lastReply ?? "").toLowerCase().includes(q)
    )
  }, [sessions, query])

  function handleOpen(id: string) {
    window.localStorage.setItem("lelwa_session_id", id)
    router.push(`/studio?session=${id}`)
  }

  function handleNewSession() {
    const freshId = `lelwa_${crypto.randomUUID()}`
    window.localStorage.setItem("lelwa_session_id", freshId)
    router.push(`/studio?session=${freshId}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Sessions</p>
          <h1 className="mt-2 font-display text-2xl text-foreground">Chat history</h1>
          <p className="mt-2 text-sm text-muted-foreground">Open a session or start a new one.</p>
        </div>
        <Button className="rounded-full" onClick={handleNewSession}>New session</Button>
      </header>

      <div className="flex items-center gap-3 rounded-full border border-border/70 bg-white/80 px-4 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sessions"
          className="h-10 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-white/80 p-8 text-center text-sm text-muted-foreground shadow-sm">
          No sessions yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((session) => (
            <div key={session.id} className="rounded-3xl border border-border/70 bg-white/80 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{session.title}</p>
                  {session.lastMessage && (
                    <p className="mt-1 text-xs text-muted-foreground">{session.lastMessage}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(session.updatedAt)}</span>
              </div>
              {session.lastReply && (
                <p className="mt-3 text-xs text-foreground/70">{session.lastReply}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Prepared</span>
                <Button variant="outline" className="rounded-full" onClick={() => handleOpen(session.id)}>
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
