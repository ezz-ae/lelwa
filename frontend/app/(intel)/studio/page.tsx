"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Loader2, Paperclip, Sparkles, X } from "lucide-react"
import { ActionId, actionThemeById, chatActions, getActionTheme } from "@/lib/lelwa-actions"

interface Attachment {
  id: string
  name: string
  size: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: Attachment[]
  tools?: string[]
}

const toolOptions = chatActions

export default function StudioPage() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const actionFromUrl = searchParams.get("action")
  const primaryAction =
    actionFromUrl && actionThemeById[actionFromUrl as ActionId]
      ? actionFromUrl
      : activeTools[activeTools.length - 1] ?? null
  const activeTheme = getActionTheme(primaryAction)

  useEffect(() => {
    const storedId = window.localStorage.getItem("lelwa_session_id")
    if (storedId) {
      setSessionId(storedId)
      return
    }
    const newId = `lelwa_${crypto.randomUUID()}`
    window.localStorage.setItem("lelwa_session_id", newId)
    setSessionId(newId)
  }, [])

  useEffect(() => {
    const storedStrategy = window.localStorage.getItem("lelwa_strategy_actions")
    if (storedStrategy) {
      try {
        const parsed = JSON.parse(storedStrategy) as string[]
        setActiveTools(Array.isArray(parsed) ? parsed : [])
      } catch {
        setActiveTools([])
      }
    }
  }, [])

  useEffect(() => {
    if (!actionFromUrl) return
    setActiveTools((prev) => (prev.includes(actionFromUrl) ? prev : [...prev, actionFromUrl]))
  }, [actionFromUrl])

  useEffect(() => {
    window.localStorage.setItem("lelwa_strategy_actions", JSON.stringify(activeTools))
  }, [activeTools])

  const handleToolToggle = (toolId: string) => {
    setActiveTools((prev) => (prev.includes(toolId) ? prev.filter((tool) => tool !== toolId) : [...prev, toolId]))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    const nextFiles = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
    }))
    setAttachments((prev) => [...prev, ...nextFiles])
    event.target.value = ""
  }

  const handleAttachmentRemove = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    const hasAttachments = attachments.length > 0
    if ((trimmed.length === 0 && !hasAttachments) || isSending) return

    const selectedToolLabels = activeTools
      .map((toolId) => toolOptions.find((tool) => tool.id === toolId)?.label)
      .filter((label): label is string => Boolean(label))
    const toolSummary = selectedToolLabels.length ? `Actions: ${selectedToolLabels.join(", ")}` : ""
    const attachmentSummary = hasAttachments ? `Attachments: ${attachments.map((file) => file.name).join(", ")}` : ""
    const fallbackMessage = trimmed.length ? trimmed : "Shared attachments."
    const outboundMessage = [fallbackMessage, attachmentSummary, toolSummary].filter(Boolean).join("\n\n")

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: fallbackMessage,
      timestamp: new Date(),
      attachments: hasAttachments ? attachments : undefined,
      tools: selectedToolLabels.length ? selectedToolLabels : undefined,
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setAttachments([])
    setIsSending(true)

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
    const activeSessionId = sessionId || `lelwa_${crypto.randomUUID()}`
    if (!sessionId) {
      window.localStorage.setItem("lelwa_session_id", activeSessionId)
      setSessionId(activeSessionId)
    }

    try {
      const response = await fetch(`${apiBase}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: outboundMessage,
          session_id: activeSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`)
      }

      const data = await response.json()
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I could not generate a response just now.",
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I could not reach Lelwa just now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsSending(false)
    }
  }

  const hasConversation = messages.length > 0
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isSending

  const composer = (
    <div className="relative mx-auto w-full max-w-3xl">
      <div
        className="pointer-events-none absolute -inset-x-6 -bottom-6 h-16 rounded-full blur-2xl opacity-70"
        style={{ background: `linear-gradient(120deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}
      />
      <div
        className="rounded-[32px] p-[1px]"
        style={{ background: `linear-gradient(135deg, ${activeTheme.stroke[0]}, ${activeTheme.stroke[1]})` }}
      >
        <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-[0_22px_60px_-50px_rgba(0,0,0,0.65)]">
        <div className="flex flex-wrap items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach"
            onClick={handleAttachClick}
            className="h-10 w-10 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Drop the lead, listing, or request. Lelwa replies, follows up, and prepares the offer."
            className="min-h-[150px] flex-1 border-none bg-transparent px-0 py-1 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                handleSend()
              }
            }}
            disabled={isSending}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSend}
              size="icon"
              aria-label="Send"
              className="h-10 w-10 rounded-full"
              disabled={!canSend}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-foreground"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleAttachmentRemove(file.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">One-click actions</span>
          {toolOptions.map((tool) => {
            const isActive = activeTools.includes(tool.id)
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolToggle(tool.id)}
                className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  borderColor: isActive ? tool.chip.border : tool.chip.idleBorder,
                  background: isActive ? tool.chip.background : tool.chip.idleBackground,
                }}
              >
                {tool.label}
              </button>
            )
          })}
        </div>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Tip: Press Cmd/Ctrl + Enter to send quickly.
      </p>
    </div>
  )

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(120,120,120,0.12),transparent_70%)]" />
      <div
        className="rounded-[32px] p-[1px]"
        style={{ background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}
      >
        <div className="rounded-[32px] border border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8">
          {hasConversation ? (
            <div className="flex min-h-[70vh] flex-col gap-8">
              <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Lelwa Chat</span>
                </div>
                <ScrollArea className="h-[52vh] pr-4">
                  <div className="space-y-6">
                    {messages.map((message) => {
                      const isUser = message.role === "user"
                      const showContext =
                        isUser && ((message.attachments?.length ?? 0) > 0 || (message.tools?.length ?? 0) > 0)
                      return (
                        <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[85%] space-y-2">
                            {isUser ? (
                              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-foreground">
                                {message.content}
                              </div>
                            ) : (
                              <div className="text-sm leading-relaxed text-foreground/90">{message.content}</div>
                            )}
                            {showContext && (
                              <div className="flex flex-wrap gap-2">
                                {message.tools?.map((tool) => (
                                  <span
                                    key={tool}
                                    className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                                  >
                                    {tool}
                                  </span>
                                ))}
                                {message.attachments?.map((file) => (
                                  <span
                                    key={file.id}
                                    className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                                  >
                                    {file.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
              {composer}
            </div>
          ) : (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-display text-3xl text-foreground">Lelwa</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    One chat to reply on WhatsApp, call leads, and send offers that close.
                  </p>
                </div>
              </div>
              {composer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
