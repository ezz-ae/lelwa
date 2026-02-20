"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useSearchParams } from "next/navigation"
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
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import { ActionId, actionThemeById, chatActions, getActionTheme } from "@/lib/lelwa-actions"
import { ConnectSheet } from "@/app/components/connect-sheet"

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
  tools?: string[]
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
  { icon: React.ElementType; accent: string; bg: string; border: string }
> = {
  reply:       { icon: MessageSquare, accent: "text-sky-400",     bg: "rgba(14,165,233,0.08)",   border: "rgba(14,165,233,0.25)"   },
  call_script: { icon: Phone,         accent: "text-violet-400",  bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.25)"   },
  offer:       { icon: FileText,      accent: "text-amber-400",   bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.25)"   },
  contract:    { icon: FileSignature, accent: "text-emerald-400", bg: "rgba(52,211,153,0.08)",   border: "rgba(52,211,153,0.25)"   },
  followups:   { icon: Calendar,      accent: "text-orange-400",  bg: "rgba(251,146,60,0.08)",   border: "rgba(251,146,60,0.25)"   },
  summary:     { icon: BarChart3,     accent: "text-slate-400",   bg: "rgba(148,163,184,0.07)",  border: "rgba(148,163,184,0.20)"  },
}

function formatFileSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

// ── Block Card ─────────────────────────────────────────────────────────────

function BlockCard({ block }: { block: PreparedBlock }) {
  const [copied, setCopied] = useState(false)
  const cfg = BLOCK_CFG[block.type] ?? BLOCK_CFG.summary
  return (
    <div className="group relative rounded-2xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <cfg.icon className={`h-3.5 w-3.5 shrink-0 ${cfg.accent}`} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">{block.title}</span>
        </div>
        <button
          type="button"
          onClick={async () => { await navigator.clipboard.writeText(block.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="flex items-center gap-1 rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted hover:text-foreground"
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
      <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground/80">
        <span>{action.label}</span>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-amber-400/80">
          Unavailable
        </span>
      </div>
    )
  }
  if (state === "error") return (
    <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive/80">
      <span>{action.label}</span>
      <span className="rounded-full border border-destructive/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-destructive/70">
        Unavailable
      </span>
    </div>
  )
  if (state === "done") return (
    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
      <Check className="h-3 w-3" /> {action.label}
    </div>
  )
  if (state === "confirm") return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Confirm</span>
      <button type="button" onClick={onConfirm}
        className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/25">
        Confirm
      </button>
    </div>
  )
  return (
    <button
      type="button"
      disabled={state === "loading"}
      onClick={action.requires === "connection" ? onConnect : action.requires === "confirmation" ? onExecute : onExecute}
      className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      {state === "loading" ? <Loader2 className="h-3 w-3 animate-spin" />
        : action.requires === "connection" ? <Zap className="h-3 w-3 text-amber-400" />
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
  const results = entry.actionResults ?? {}

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {blocks.length > 0 && (
        <div className="mb-3 space-y-2.5">{blocks.map((b, i) => <BlockCard key={i} block={b} />)}</div>
      )}
      {blocks.length === 0 && entry.reply && (
        <p className="mb-3 text-sm leading-relaxed text-foreground/85">{entry.reply}</p>
      )}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
                  className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400 transition hover:bg-amber-500/20"
                >
                  ↓ Download PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 text-[10px] text-muted-foreground/40">{formatTime(entry.timestamp)}</div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

const toolOptions = chatActions

export default function StudioPage() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [healthStatus, setHealthStatus] = useState<"unknown" | "done" | "unavailable">("unknown")

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

  const actionFromUrl = searchParams.get("action")
  const primaryAction = actionFromUrl && actionThemeById[actionFromUrl as ActionId] ? actionFromUrl
    : activeTools[activeTools.length - 1] ?? null
  const activeTheme = getActionTheme(primaryAction)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

  useEffect(() => { feedEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [feed, isSending])

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
    const stored = window.localStorage.getItem("lelwa_session_id")
    const activeId = stored ?? `lelwa_${crypto.randomUUID()}`
    if (!stored) window.localStorage.setItem("lelwa_session_id", activeId)
    setSessionId(activeId)

    // Restore feed for this session (survives page refresh)
    try {
      const raw = window.localStorage.getItem(`lelwa_feed_${activeId}`)
      if (raw) {
        const parsed = JSON.parse(raw) as FeedEntry[]
        // Rehydrate Date objects (JSON serialises them as strings)
        setFeed(parsed.map((e) => ({ ...e, timestamp: new Date(e.timestamp) })))
      }
    } catch { /* ignore malformed storage */ }
  }, [])

  // Persist feed to localStorage whenever it changes
  useEffect(() => {
    if (!sessionId || feed.length === 0) return
    try {
      // Keep only the last 50 entries to cap storage usage
      const toStore = feed.slice(-50)
      window.localStorage.setItem(`lelwa_feed_${sessionId}`, JSON.stringify(toStore))
    } catch { /* quota exceeded — skip */ }
  }, [feed, sessionId])

  useEffect(() => {
    const s = window.localStorage.getItem("lelwa_strategy_actions")
    if (s) { try { const p = JSON.parse(s) as string[]; setActiveTools(Array.isArray(p) ? p : []) } catch { setActiveTools([]) } }
  }, [])

  useEffect(() => {
    if (!actionFromUrl) return
    setActiveTools((prev) => prev.includes(actionFromUrl) ? prev : [...prev, actionFromUrl])
  }, [actionFromUrl])

  useEffect(() => {
    window.localStorage.setItem("lelwa_strategy_actions", JSON.stringify(activeTools))
  }, [activeTools])

  // ── Action state helpers ───────────────────────────────────────

  function setActionState(entryId: string, actionId: string, state: FeedEntry["actionState"] extends Record<string, infer S> ? S : never) {
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
        // Tool needs a channel — open ConnectSheet with the resume_token
        setActionState(entryId, action.id, "idle")
        setConnectSheet({
          open: true,
          entryId,
          action,
          requirement: {
            channel: data.channel,
            prompt: data.prompt,
            fields: data.fields ?? [],
            resume_token: data.resume_token,   // backend-generated, single-use
          },
        })
        return
      }

      // Application-level error (e.g. Twilio rejected, invalid credentials)
      if (data?.error) {
        setActionState(entryId, action.id, "error")
        setTimeout(() => setActionState(entryId, action.id, "idle"), 5000)
        return
      }

      // Store any PDF URL returned by document generation tools
      if (data?.pdf_url) {
        setFeed((prev) => prev.map((e) =>
          e.id === entryId
            ? { ...e, actionResults: { ...(e.actionResults ?? {}), [action.id]: { pdf_url: data.pdf_url } } }
            : e
        ))
      }

      setActionState(entryId, action.id, "done")
    } catch {
      // Network-level error
      setActionState(entryId, action.id, "error")
      setTimeout(() => setActionState(entryId, action.id, "idle"), 5000)
    }
  }

  function handleConfirmAction(entryId: string, actionId: string) {
    const action = feed.find((e) => e.id === entryId)?.prepared_actions?.find((a) => a.id === actionId)
    if (action) executeAction(entryId, action)
  }

  function handleConnectRequired(entryId: string, action: PreparedAction) {
    // Opened from the action button — no resume_token yet (we need to hit the tool first)
    // So we call executeAction which will trigger the flow above
    executeAction(entryId, action)
  }

  function handleConnected(resumeResult?: Record<string, unknown>) {
    const { entryId, action } = connectSheet
    setConnectSheet({ open: false, entryId: "", action: null, requirement: null })

    if (resumeResult?.status === "executed" && action) {
      // Resume succeeded — mark action as done
      setActionState(entryId, action.id, "done")
    } else if (action) {
      // No resume (proactive connect from connect page) — no action to update
    }
  }

  // ── Send ────────────────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = input.trim()
    const hasAttachments = attachments.length > 0
    if ((trimmed.length === 0 && !hasAttachments) || isSending) return

    const selectedToolLabels = activeTools
      .map((id) => toolOptions.find((t) => t.id === id)?.label)
      .filter((l): l is string => Boolean(l))
    const toolSummary = selectedToolLabels.length ? `Actions: ${selectedToolLabels.join(", ")}` : ""
    const attachmentSummary = hasAttachments ? `Attachments: ${attachments.map((f) => f.name).join(", ")}` : ""
    const fallbackMsg = trimmed.length ? trimmed : "Shared attachments."
    const outbound = [fallbackMsg, attachmentSummary, toolSummary].filter(Boolean).join("\n\n")

    const userEntry: FeedEntry = {
      id: Date.now().toString(),
      type: "user",
      content: fallbackMsg,
      timestamp: new Date(),
      attachments: hasAttachments ? attachments : undefined,
      tools: selectedToolLabels.length ? selectedToolLabels : undefined,
    }

    setFeed((prev) => [...prev, userEntry])
    setInput("")
    setAttachments([])
    setIsSending(true)
    if (textareaRef.current) textareaRef.current.style.height = "auto"

    const activeSessionId = sessionId || `lelwa_${crypto.randomUUID()}`
    if (!sessionId) { window.localStorage.setItem("lelwa_session_id", activeSessionId); setSessionId(activeSessionId) }

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
    } catch {
      setFeed((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "work",
          timestamp: new Date(),
          reply: "Connection error. Check your network and try again.",
          prepared_blocks: [],
          prepared_actions: [],
          actionState: {},
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  // ── Composer ────────────────────────────────────────────────────

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isSending

  const composer = (
    <div className="relative mx-auto w-full max-w-3xl">
      <div
        className="pointer-events-none absolute -inset-x-6 -bottom-6 h-16 rounded-full blur-2xl opacity-50"
        style={{ background: `linear-gradient(120deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}
      />
      <div className="rounded-[28px] p-[1px]" style={{ background: `linear-gradient(135deg, ${activeTheme.stroke[0]}, ${activeTheme.stroke[1]})` }}>
        <div className="rounded-[27px] border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent px-4 pt-3 pb-3 shadow-[0_22px_60px_-50px_rgba(0,0,0,0.65)]">
          <div className="flex items-start gap-3">
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 h-8 w-8 shrink-0 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                const el = e.target; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 200)}px`
              }}
              placeholder="Lead, listing, or request."
              className="min-h-[48px] max-h-[200px] flex-1 resize-none border-none bg-transparent px-0 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSend() } }}
              disabled={isSending}
              rows={1}
            />
            <Button onClick={handleSend} size="icon" aria-label="Send" disabled={!canSend}
              className="mt-1 h-8 w-8 shrink-0 rounded-full border-0 transition-all"
              style={canSend ? { background: `linear-gradient(135deg, ${activeTheme.stroke[0]}, ${activeTheme.stroke[1]})`, boxShadow: `0 4px 16px -4px ${activeTheme.glow[0]}`, color: "white" } : undefined}>
              {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-foreground">
                  <Paperclip className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <span className="text-muted-foreground/60">{formatFileSize(file.size)}</span>
                  <button type="button" onClick={() => setAttachments((p) => p.filter((f) => f.id !== file.id))}
                    className="ml-0.5 text-muted-foreground hover:text-foreground" aria-label={`Remove ${file.name}`}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
            <span className="mr-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">Actions</span>
            {toolOptions.map((tool) => {
              const isActive = activeTools.includes(tool.id)
              return (
                <button key={tool.id} type="button"
                  onClick={() => setActiveTools((prev) => prev.includes(tool.id) ? prev.filter((t) => t !== tool.id) : [...prev, tool.id])}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={{ borderColor: isActive ? tool.chip.border : tool.chip.idleBorder, background: isActive ? tool.chip.background : tool.chip.idleBackground, boxShadow: isActive ? `0 0 12px -4px ${tool.chip.border}` : undefined }}>
                  {tool.label}
                </button>
              )
            })}
          </div>
          <input
            ref={fileInputRef} type="file" multiple className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const files = Array.from(e.target.files ?? [])
              if (!files.length) return
              setAttachments((prev) => [...prev, ...files.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size }))])
              e.target.value = ""
            }}
          />
        </div>
      </div>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────

  const hasFeed = feed.length > 0

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(120,120,120,0.12),transparent_70%)]" />
        <div className="rounded-[32px] p-[1px]" style={{ background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}>
          <div className="relative rounded-[31px] border border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8">
            <div className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-medium text-muted-foreground/80">
              <span className="uppercase tracking-[0.18em]">Activity</span>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">
                {healthStatus === "done" ? "Done" : "Unavailable"}
              </span>
            </div>
            {hasFeed ? (
              <div className="flex min-h-[70vh] flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})`, boxShadow: `0 4px 16px -6px ${activeTheme.glow[0]}` }}>
                    <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">Lelwa</span>
                </div>

                {/* Feed */}
                <ScrollArea className="h-[52vh] pr-2">
                  <div className="space-y-6 pb-2">
                    {feed.map((entry) => {
                      if (entry.type === "user") return (
                        <div key={entry.id} className="flex justify-end">
                          <div className="flex max-w-[70%] flex-col items-end gap-1">
                            <div className="rounded-2xl rounded-tr-sm bg-muted/50 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                              {entry.content}
                            </div>
                            {((entry.attachments?.length ?? 0) > 0 || (entry.tools?.length ?? 0) > 0) && (
                              <div className="flex flex-wrap justify-end gap-1.5">
                                {entry.tools?.map((t) => (
                                  <span key={t} className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground">{t}</span>
                                ))}
                                {entry.attachments?.map((f) => (
                                  <span key={f.id} className="flex items-center gap-1 rounded-full border border-border/40 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                                    <Paperclip className="h-2.5 w-2.5" />{f.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="px-1 text-[10px] text-muted-foreground/40">{formatTime(entry.timestamp)}</span>
                          </div>
                        </div>
                      )

                      return (
                        <div key={entry.id} className="flex gap-3">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full"
                            style={{ background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}>
                            <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
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
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}>
                          <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/40 px-4 py-3">
                          {[0, 160, 320].map((delay) => (
                            <span key={delay} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={feedEndRef} />
                  </div>
                </ScrollArea>

                {composer}
              </div>
            ) : (
              <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})`, boxShadow: `0 8px 32px -8px ${activeTheme.glow[0]}` }}>
                    <Sparkles className="h-7 w-7 text-foreground/90" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl text-foreground">Lelwa</h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      Submit a lead, property reference, or request.
                    </p>
                  </div>
                  {activeTools.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {activeTools.map((toolId) => {
                        const tool = toolOptions.find((t) => t.id === toolId)
                        if (!tool) return null
                        return (
                          <span key={toolId} className="rounded-full border px-3 py-1 text-[11px] font-medium text-foreground"
                            style={{ borderColor: tool.chip.border, background: tool.chip.background }}>
                            {tool.label}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                {composer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JIT Connect Sheet — wired with resume_token */}
      <ConnectSheet
        isOpen={connectSheet.open}
        channel={connectSheet.requirement?.channel ?? ""}
        prompt={connectSheet.requirement?.prompt ?? "Not connected."}
        fields={connectSheet.requirement?.fields ?? []}
        resumeToken={connectSheet.requirement?.resume_token}
        onClose={() => setConnectSheet({ open: false, entryId: "", action: null, requirement: null })}
        onConnected={handleConnected}
      />
    </>
  )
}
