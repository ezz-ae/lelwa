"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowUp,
  BarChart3,
  Calendar,
  Check,
  ClipboardCopy,
  FileSignature,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Phone,
  X,
  Zap,
} from "lucide-react"
import { ConnectSheet } from "@/app/components/connect-sheet"
import { startActionById } from "@/lib/lelwa-actions"
import { getProjectName, listProjects, type Project } from "@/lib/project-store"
import { listSessions, loadFeed, upsertSession, type SessionSummary } from "@/lib/session-store"

// ── Types ──────────────────────────────────────────────────────────────────

interface Attachment { id: string; name: string; size: number }

interface PreparedBlock {
  type: "reply" | "call_script" | "offer" | "contract" | "followups" | "summary"
  title: string
  content: string
}

interface PreparedAction {
  id: string
  label: string
  tool_name: string
  args: Record<string, unknown>
  requires: "none" | "confirmation" | "connection"
}

interface ConnectRequirement {
  channel: string
  prompt: string
  fields: { key: string; type: "text" | "password" | "tel"; label: string }[]
  resume_token?: string
}

interface FeedEntry {
  id: string
  type: "user" | "work"
  timestamp: Date
  // user
  content?: string
  attachments?: Attachment[]
  // work
  reply?: string
  prepared_blocks?: PreparedBlock[]
  prepared_actions?: PreparedAction[]
  actionState?: Record<string, "idle" | "loading" | "done" | "error" | "confirm">
  actionResults?: Record<string, { pdf_url?: string }>
}

const REQUIRED_ARGS_BY_TOOL: Record<string, string[]> = {
  send_whatsapp: ["to_number"],
  call_investor: ["to_number"],
}

function isActionBlocked(action: PreparedAction) {
  const required = REQUIRED_ARGS_BY_TOOL[action.tool_name]
  if (!required) return false
  return required.some((key) => {
    const value = action.args?.[key]
    if (typeof value === "string") return value.trim().length === 0
    return value == null
  })
}

// ── Block config ───────────────────────────────────────────────────────────

const BLOCK_CFG: Record<
  PreparedBlock["type"],
  { icon: React.ElementType; tone: string; bg: string; border: string }
> = {
  reply:       { icon: MessageSquare, tone: "text-emerald-200", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  call_script: { icon: Phone,         tone: "text-amber-200",   bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  offer:       { icon: FileText,      tone: "text-sky-200",     bg: "bg-sky-500/10",    border: "border-sky-500/20" },
  contract:    { icon: FileSignature, tone: "text-teal-200",    bg: "bg-teal-500/10",   border: "border-teal-500/20" },
  followups:   { icon: Calendar,      tone: "text-lime-200",    bg: "bg-lime-500/10",   border: "border-lime-500/20" },
  summary:     { icon: BarChart3,     tone: "text-slate-200",   bg: "bg-white/5",       border: "border-white/10" },
}

function formatFileSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function toSessionTitle(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if (!cleaned) return "Session"
  return cleaned.length > 56 ? `${cleaned.slice(0, 56)}…` : cleaned
}

// ── Block Card ─────────────────────────────────────────────────────────────

function BlockCard({ block }: { block: PreparedBlock }) {
  const [copied, setCopied] = useState(false)
  const cfg = BLOCK_CFG[block.type] ?? BLOCK_CFG.summary
  return (
    <div className={`group rounded-2xl border ${cfg.border} ${cfg.bg} p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <cfg.icon className={`h-3.5 w-3.5 shrink-0 ${cfg.tone}`} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            {block.title}
          </span>
        </div>
        <button
          type="button"
          onClick={async () => { await navigator.clipboard.writeText(block.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-white/10"
        >
          {copied ? <Check className="h-2.5 w-2.5" /> : <ClipboardCopy className="h-2.5 w-2.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{block.content}</p>
    </div>
  )
}

// ── Action Button ──────────────────────────────────────────────────────────

function ActionButton({
  action, state, onExecute, onConfirm, onConnect,
  blocked,
}: {
  action: PreparedAction
  state: "idle" | "loading" | "done" | "error" | "confirm"
  onExecute: () => void
  onConfirm: () => void
  onConnect: () => void
  blocked: boolean
}) {
  if (blocked) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground/80">
        <span>{action.label}</span>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-amber-200">
          Unavailable
        </span>
      </div>
    )
  }
  if (state === "error") return (
    <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive/90">
      <span>{action.label}</span>
      <span className="rounded-full border border-destructive/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-destructive/70">
        Unavailable
      </span>
    </div>
  )
  if (state === "done") return (
    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-200">
      <Check className="h-3 w-3" /> {action.label}
    </div>
  )
  if (state === "confirm") return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Confirm</span>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/25"
      >
        Confirm
      </button>
    </div>
  )
  return (
    <button
      type="button"
      disabled={state === "loading"}
      onClick={action.requires === "connection" ? onConnect : action.requires === "confirmation" ? onExecute : onExecute}
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/90 transition hover:bg-white/10 disabled:opacity-50"
    >
      {state === "loading" ? <Loader2 className="h-3 w-3 animate-spin" />
        : action.requires === "connection" ? <Zap className="h-3 w-3 text-amber-200" />
        : <ArrowUp className="h-3 w-3" />}
      {action.label}
    </button>
  )
}

// ── Work Card ──────────────────────────────────────────────────────────────

function WorkCard({ entry, onActionClick, onConfirmAction, onConnectRequired }: {
  entry: FeedEntry
  onActionClick: (entryId: string, action: PreparedAction) => void
  onConfirmAction: (entryId: string, actionId: string) => void
  onConnectRequired: (entryId: string, action: PreparedAction) => void
}) {
  const blocks = entry.prepared_blocks ?? []
  const actions = entry.prepared_actions ?? []
  const states = entry.actionState ?? {}

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Prepared</span>
        {blocks.length > 0 && <span>{blocks.length} Items</span>}
      </div>
      {entry.reply && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{entry.reply}</p>
      )}
      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <div key={action.id} className="flex flex-col gap-1">
              <ActionButton
                action={action}
                state={states[action.id] ?? "idle"}
                blocked={isActionBlocked(action)}
                onExecute={() => {
                  if (action.requires === "confirmation" && states[action.id] !== "confirm") {
                    onActionClick(entry.id, action)
                  } else {
                    onConfirmAction(entry.id, action.id)
                  }
                }}
                onConfirm={() => onConfirmAction(entry.id, action.id)}
                onConnect={() => onConnectRequired(entry.id, action)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 text-[10px] text-muted-foreground/60">{formatTime(entry.timestamp)}</div>
    </div>
  )
}

// ── Prepared Canvas ────────────────────────────────────────────────────────

function PreparedCanvas({
  entry,
  onActionClick,
  onConfirmAction,
  onConnectRequired,
}: {
  entry: FeedEntry | null
  onActionClick: (entryId: string, action: PreparedAction) => void
  onConfirmAction: (entryId: string, actionId: string) => void
  onConnectRequired: (entryId: string, action: PreparedAction) => void
}) {
  if (!entry) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-muted-foreground">
        Prepared output appears after the first message.
      </div>
    )
  }

  const blocks = entry.prepared_blocks ?? []
  const actions = entry.prepared_actions ?? []
  const states = entry.actionState ?? {}
  const results = entry.actionResults ?? {}

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Prepared</p>
          <h2 className="mt-1 text-base font-semibold text-foreground">Canvas</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Active
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {blocks.map((block, index) => (
          <BlockCard key={`${block.type}-${index}`} block={block} />
        ))}
      </div>

      {actions.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Action</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((action) => (
              <div key={action.id} className="flex flex-col gap-1">
                <ActionButton
                  action={action}
                  state={states[action.id] ?? "idle"}
                  blocked={isActionBlocked(action)}
                  onExecute={() => {
                    if (action.requires === "confirmation" && states[action.id] !== "confirm") {
                      onActionClick(entry.id, action)
                    } else {
                      onConfirmAction(entry.id, action.id)
                    }
                  }}
                  onConfirm={() => onConfirmAction(entry.id, action.id)}
                  onConnect={() => onConnectRequired(entry.id, action)}
                />
                {states[action.id] === "done" && results[action.id]?.pdf_url && (
                  <a
                    href={results[action.id].pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-200 transition hover:bg-amber-500/20"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function StudioPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [healthStatus, setHealthStatus] = useState<"unknown" | "done" | "unavailable">("unknown")
  const [projectName, setProjectName] = useState<string | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])

  // Connect sheet state — includes resume_token for automatic retry
  const [connectSheet, setConnectSheet] = useState<{
    open: boolean
    entryId: string
    action: PreparedAction | null
    requirement: ConnectRequirement | null
  }>({ open: false, entryId: "", action: null, requirement: null })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const feedEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  const actionParam = searchParams.get("action") ?? searchParams.get("start")
  const promptParam = searchParams.get("prompt")
  const sessionParam = searchParams.get("session")
  const projectParam = searchParams.get("project")

  const activeSessionTitle = useMemo(() => {
    if (!sessionId) return "Session"
    return recentSessions.find((s) => s.id === sessionId)?.title ?? "Session"
  }, [recentSessions, sessionId])

  const importedFiles = useMemo(() => {
    const deduped = new Map<string, Attachment>()
    for (const entry of feed) {
      if (!entry.attachments) continue
      for (const file of entry.attachments) {
        if (!deduped.has(file.name)) deduped.set(file.name, file)
      }
    }
    return Array.from(deduped.values()).slice(0, 6)
  }, [feed])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [feed, isSending])

  useEffect(() => {
    const existingUser = window.localStorage.getItem("lelwa_user_id")
    if (!existingUser) {
      window.localStorage.setItem("lelwa_user_id", `user_${crypto.randomUUID()}`)
    }
  }, [])

  useEffect(() => {
    if (projectParam) {
      window.localStorage.setItem("lelwa_active_project", projectParam)
      setProjectName(getProjectName(projectParam))
      return
    }
    const storedProject = window.localStorage.getItem("lelwa_active_project")
    setProjectName(getProjectName(storedProject))
  }, [projectParam])

  useEffect(() => {
    let cancelled = false
    async function checkHealth() {
      try {
        const res = await fetch(`${apiBase}/health`, { cache: "no-store" })
        if (!cancelled) setHealthStatus(res.ok ? "done" : "unavailable")
      } catch {
        if (!cancelled) setHealthStatus("unavailable")
      }
    }
    checkHealth()
    const timer = window.setInterval(checkHealth, 30000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [apiBase])

  // Session init + feed hydration from localStorage
  useEffect(() => {
    let activeId = sessionParam || window.localStorage.getItem("lelwa_session_id")
    const forceNew = Boolean(actionParam) && !sessionParam

    if (forceNew) {
      activeId = `lelwa_${crypto.randomUUID()}`
      window.localStorage.setItem("lelwa_session_id", activeId)
      setFeed([])
    } else if (!activeId) {
      activeId = `lelwa_${crypto.randomUUID()}`
      window.localStorage.setItem("lelwa_session_id", activeId)
    }

    if (sessionParam) {
      window.localStorage.setItem("lelwa_session_id", sessionParam)
    }

    setSessionId(activeId)

    if (!forceNew && activeId) {
      try {
        const rawFeed = loadFeed(activeId) as FeedEntry[]
        if (rawFeed.length) {
          setFeed(rawFeed.map((e) => ({ ...e, timestamp: new Date(e.timestamp) })))
        }
      } catch {
        // ignore malformed storage
      }
    }
  }, [sessionParam, actionParam])

  useEffect(() => {
    setRecentSessions(listSessions().slice(0, 6))
  }, [feed, sessionId])

  useEffect(() => {
    setRecentProjects(listProjects().slice(0, 6))
  }, [projectParam])

  useEffect(() => {
    if (input.trim()) return
    if (promptParam) {
      setInput(promptParam)
      return
    }
    if (actionParam && startActionById[actionParam as keyof typeof startActionById]) {
      setInput(startActionById[actionParam as keyof typeof startActionById].prompt)
    }
  }, [promptParam, actionParam, input])

  // Persist feed to localStorage whenever it changes
  useEffect(() => {
    if (!sessionId || feed.length === 0) return
    try {
      const toStore = feed.slice(-50)
      window.localStorage.setItem(`lelwa_feed_${sessionId}`, JSON.stringify(toStore))
    } catch {
      // quota exceeded — skip
    }
  }, [feed, sessionId])

  // ── Action state helpers ───────────────────────────────────────

  function setActionState(entryId: string, actionId: string, state: "idle" | "loading" | "done" | "error" | "confirm") {
    setFeed((prev) => prev.map((e) =>
      e.id === entryId ? { ...e, actionState: { ...(e.actionState ?? {}), [actionId]: state } } : e
    ))
  }

  function handleActionClick(entryId: string, action: PreparedAction) {
    if (action.requires === "confirmation") {
      setActionState(entryId, action.id, "confirm")
    } else {
      executeAction(entryId, action)
    }
  }

  async function executeAction(entryId: string, action: PreparedAction) {
    setActionState(entryId, action.id, "loading")
    try {
      const res = await fetch(`${apiBase}/v1/tools/${action.tool_name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_name: action.tool_name,
          args: action.args,
          user_id: "default",
          session_id: sessionId || "direct",
        }),
      })
      const data = await res.json()

      if (data?.requires_connection) {
        setActionState(entryId, action.id, "idle")
        setConnectSheet({
          open: true,
          entryId,
          action,
          requirement: {
            channel: data.channel,
            prompt: data.prompt,
            fields: data.fields ?? [],
            resume_token: data.resume_token,
          },
        })
        return
      }

      if (data?.error) {
        setActionState(entryId, action.id, "error")
        setTimeout(() => setActionState(entryId, action.id, "idle"), 5000)
        return
      }

      if (data?.pdf_url) {
        setFeed((prev) => prev.map((e) =>
          e.id === entryId
            ? { ...e, actionResults: { ...(e.actionResults ?? {}), [action.id]: { pdf_url: data.pdf_url } } }
            : e
        ))
      }

      setActionState(entryId, action.id, "done")
    } catch {
      setActionState(entryId, action.id, "error")
      setTimeout(() => setActionState(entryId, action.id, "idle"), 5000)
    }
  }

  function handleConfirmAction(entryId: string, actionId: string) {
    const action = feed.find((e) => e.id === entryId)?.prepared_actions?.find((a) => a.id === actionId)
    if (action) executeAction(entryId, action)
  }

  function handleConnectRequired(entryId: string, action: PreparedAction) {
    executeAction(entryId, action)
  }

  function handleConnected(resumeResult?: Record<string, unknown>) {
    const { entryId, action } = connectSheet
    setConnectSheet({ open: false, entryId: "", action: null, requirement: null })

    if (resumeResult?.status === "executed" && action) {
      setActionState(entryId, action.id, "done")
    }
  }

  function startNewSession() {
    const freshId = `lelwa_${crypto.randomUUID()}`
    window.localStorage.setItem("lelwa_session_id", freshId)
    setSessionId(freshId)
    setFeed([])
    router.push(`/studio?session=${freshId}`)
  }

  function openSession(id: string) {
    window.localStorage.setItem("lelwa_session_id", id)
    router.push(`/studio?session=${id}`)
  }

  function openProject(id: string) {
    window.localStorage.setItem("lelwa_active_project", id)
    router.push(`/studio?project=${id}`)
  }

  // ── Send ────────────────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = input.trim()
    const hasAttachments = attachments.length > 0
    if ((trimmed.length === 0 && !hasAttachments) || isSending) return

    const attachmentSummary = hasAttachments ? `Attachments: ${attachments.map((f) => f.name).join(", ")}` : ""
    const fallbackMsg = trimmed.length ? trimmed : "Shared attachments."
    const outbound = [fallbackMsg, attachmentSummary].filter(Boolean).join("\n\n")

    const userEntry: FeedEntry = {
      id: Date.now().toString(),
      type: "user",
      content: fallbackMsg,
      timestamp: new Date(),
      attachments: hasAttachments ? attachments : undefined,
    }

    setFeed((prev) => [...prev, userEntry])
    setInput("")
    setAttachments([])
    setIsSending(true)
    if (textareaRef.current) textareaRef.current.style.height = "auto"

    const activeSessionId = sessionId || `lelwa_${crypto.randomUUID()}`
    if (!sessionId) {
      window.localStorage.setItem("lelwa_session_id", activeSessionId)
      setSessionId(activeSessionId)
    }

    upsertSession({
      id: activeSessionId,
      title: toSessionTitle(fallbackMsg),
      lastMessage: fallbackMsg,
      updatedAt: new Date().toISOString(),
    })

    try {
      const res = await fetch(`${apiBase}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outbound, session_id: activeSessionId, user_id: "default" }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()

      const workEntry: FeedEntry = {
        id: (Date.now() + 1).toString(),
        type: "work",
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        reply: data.reply,
        prepared_blocks: data.prepared_blocks ?? [],
        prepared_actions: data.prepared_actions ?? [],
        actionState: Object.fromEntries(
          (data.prepared_actions ?? []).map((a: PreparedAction) => [a.id, "idle"])
        ),
      }
      setFeed((prev) => [...prev, workEntry])

      upsertSession({
        id: activeSessionId,
        lastReply: data.reply,
        updatedAt: new Date().toISOString(),
      })
    } catch {
      const fallbackReply = "Prepared reply ready."
      const fallbackCall = "Call the lead, confirm the request, budget, and next step."
      const fallbackActions: PreparedAction[] = [
        {
          id: `send_whatsapp_${Date.now()}`,
          label: "Send WhatsApp",
          tool_name: "send_whatsapp",
          args: { to_number: "", message_body: fallbackReply },
          requires: "connection",
        },
        {
          id: `call_investor_${Date.now() + 1}`,
          label: "Call lead",
          tool_name: "call_investor",
          args: { to_number: "", message: fallbackCall },
          requires: "connection",
        },
      ]

      setFeed((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "work",
          timestamp: new Date(),
          reply: fallbackReply,
          prepared_blocks: [
            { type: "reply", title: "Reply", content: fallbackReply },
            { type: "call_script", title: "Call script", content: fallbackCall },
          ],
          prepared_actions: fallbackActions,
          actionState: Object.fromEntries(fallbackActions.map((a) => [a.id, "idle"])),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  // ── Composer ────────────────────────────────────────────────────

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isSending

  const composer = (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Attach file"
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 h-8 w-8 shrink-0 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            const el = e.target
            el.style.height = "auto"
            el.style.height = `${Math.min(el.scrollHeight, 200)}px`
          }}
          placeholder="Lead, listing, or request"
          className="min-h-[48px] max-h-[200px] flex-1 resize-none border-none bg-transparent px-0 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend() } }}
          disabled={isSending}
          rows={1}
        />
        <Button
          onClick={handleSend}
          size="icon"
          aria-label="Send"
          disabled={!canSend}
          className="mt-1 h-8 w-8 shrink-0 rounded-full border-0 bg-emerald-400 text-emerald-950 transition-all disabled:opacity-40"
        >
          {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
          {attachments.map((file) => (
            <div key={file.id} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-foreground">
              <Paperclip className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
              <span className="max-w-[120px] truncate">{file.name}</span>
              <span className="text-muted-foreground/60">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => setAttachments((p) => p.filter((f) => f.id !== file.id))}
                className="ml-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files ?? [])
          if (!files.length) return
          setAttachments((prev) => [...prev, ...files.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size }))])
          e.target.value = ""
        }}
      />
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────

  const hasFeed = feed.length > 0
  const latestWorkEntry = [...feed].reverse().find((entry) => entry.type === "work") ?? null

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Console</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
            <span className="font-semibold">Work feed</span>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-muted-foreground">{projectName ?? activeSessionTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            {healthStatus === "done" ? "Done" : "Unavailable"}
          </span>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 text-foreground hover:bg-white/10"
            onClick={startNewSession}
          >
            New session
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="hidden h-full flex-col gap-5 border-r border-white/10 bg-black/20 px-5 py-6 lg:flex">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <span>Imports</span>
              <span>{importedFiles.length} Files</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-3 text-left text-xs text-muted-foreground transition hover:bg-white/10"
            >
              Add files
            </button>
            {importedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {importedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-2 text-xs text-foreground/80">
                    <span className="truncate">{file.name}</span>
                    <span className="text-muted-foreground/60">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Sessions</p>
              <button
                type="button"
                onClick={() => router.push("/sessions")}
                className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 hover:text-foreground"
              >
                View all
              </button>
            </div>
            {recentSessions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                No sessions yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((session) => {
                  const isActive = session.id === sessionId
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => openSession(session.id)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
                        isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                          : "border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10"
                      }`}
                    >
                      <p className="truncate font-medium">{session.title}</p>
                      {session.lastMessage && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground/80">{session.lastMessage}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Projects</p>
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 hover:text-foreground"
              >
                View all
              </button>
            </div>
            {recentProjects.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                No projects yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((project) => {
                  const isActive = project.name === projectName
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => openProject(project.id)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
                        isActive
                          ? "border-sky-500/30 bg-sky-500/10 text-sky-100"
                          : "border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10"
                      }`}
                    >
                      <p className="truncate font-medium">{project.name}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col border-white/10 bg-black/10 lg:border-x">
          <div className="flex-1 px-6 py-5">
            {hasFeed ? (
              <ScrollArea className="h-full pr-2">
                <div className="space-y-5 pb-4">
                  {feed.map((entry) => {
                    if (entry.type === "user") return (
                      <div key={entry.id} className="flex justify-end">
                        <div className="flex max-w-[78%] flex-col items-end gap-1">
                          <div className="rounded-2xl rounded-tr-sm border border-white/10 bg-white/10 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                            {entry.content}
                          </div>
                          {((entry.attachments?.length ?? 0) > 0) && (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {entry.attachments?.map((f) => (
                                <span key={f.id} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                                  <Paperclip className="h-2.5 w-2.5" />{f.name}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="px-1 text-[10px] text-muted-foreground/60">{formatTime(entry.timestamp)}</span>
                        </div>
                      </div>
                    )

                    return (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <WorkCard
                            entry={entry}
                            onActionClick={handleActionClick}
                            onConfirmAction={handleConfirmAction}
                            onConnectRequired={handleConnectRequired}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {isSending && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
                        {[0, 160, 320].map((delay) => (
                          <span key={delay} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={feedEndRef} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Start with a lead</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Reply, Call script, Offer.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-6 py-4">
            {composer}
          </div>

          <div className="px-6 pb-6 lg:hidden">
            <PreparedCanvas
              entry={latestWorkEntry}
              onActionClick={handleActionClick}
              onConfirmAction={handleConfirmAction}
              onConnectRequired={handleConnectRequired}
            />
          </div>
        </section>

        <aside className="hidden h-full flex-col border-l border-white/10 bg-black/20 px-5 py-6 lg:flex">
          <PreparedCanvas
            entry={latestWorkEntry}
            onActionClick={handleActionClick}
            onConfirmAction={handleConfirmAction}
            onConnectRequired={handleConnectRequired}
          />
        </aside>
      </div>

      <ConnectSheet
        isOpen={connectSheet.open}
        channel={connectSheet.requirement?.channel ?? ""}
        prompt={connectSheet.requirement?.prompt ?? "Not connected."}
        fields={connectSheet.requirement?.fields ?? []}
        resumeToken={connectSheet.requirement?.resume_token}
        onClose={() => setConnectSheet({ open: false, entryId: "", action: null, requirement: null })}
        onConnected={handleConnected}
      />
    </div>
  )
}
