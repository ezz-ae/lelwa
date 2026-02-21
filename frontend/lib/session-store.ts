export type SessionSummary = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessage?: string
  lastReply?: string
}

const SESSIONS_KEY = "lelwa_sessions"

function readSessions(): SessionSummary[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(SESSIONS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as SessionSummary[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessions(list: SessionSummary[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(list))
}

export function listSessions(): SessionSummary[] {
  return readSessions()
}

export function upsertSession(update: Partial<SessionSummary> & { id: string }) {
  if (typeof window === "undefined") return
  const existing = readSessions()
  const now = new Date().toISOString()
  const current = existing.find((s) => s.id === update.id)
  const next: SessionSummary = {
    id: update.id,
    title: update.title || current?.title || "Session",
    createdAt: current?.createdAt || now,
    updatedAt: update.updatedAt || now,
    lastMessage: update.lastMessage ?? current?.lastMessage,
    lastReply: update.lastReply ?? current?.lastReply,
  }
  const filtered = existing.filter((s) => s.id !== update.id)
  writeSessions([next, ...filtered].slice(0, 50))
}

export function loadFeed(sessionId: string) {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(`lelwa_feed_${sessionId}`)
  if (!raw) return []
  try {
    return JSON.parse(raw) as unknown[]
  } catch {
    return []
  }
}
