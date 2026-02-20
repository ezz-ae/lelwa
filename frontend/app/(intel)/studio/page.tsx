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

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function StudioPage() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const actionFromUrl = searchParams.get("action")
  const primaryAction =
    actionFromUrl && actionThemeById[actionFromUrl as ActionId]
      ? actionFromUrl
      : activeTools[activeTools.length - 1] ?? null
  const activeTheme = getActionTheme(primaryAction)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending])

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

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
    const el = event.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
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

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

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
        className="pointer-events-none absolute -inset-x-6 -bottom-6 h-16 rounded-full blur-2xl opacity-60"
        style={{ background: `linear-gradient(120deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})` }}
      />
      <div
        className="rounded-[28px] p-[1px]"
        style={{ background: `linear-gradient(135deg, ${activeTheme.stroke[0]}, ${activeTheme.stroke[1]})` }}
      >
        <div className="rounded-[27px] border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent px-4 pt-3 pb-3 shadow-[0_22px_60px_-50px_rgba(0,0,0,0.65)]">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Attach file"
              onClick={handleAttachClick}
              className="mt-1 h-8 w-8 shrink-0 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Drop the lead, listing, or request. Lelwa replies, follows up, and prepares the offer."
              className="min-h-[48px] max-h-[200px] flex-1 resize-none border-none bg-transparent px-0 py-2 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              disabled={isSending}
              rows={1}
            />
            <Button
              onClick={handleSend}
              size="icon"
              aria-label="Send"
              className="mt-1 h-8 w-8 shrink-0 rounded-full border-0 transition-all"
              disabled={!canSend}
              style={
                canSend
                  ? {
                      background: `linear-gradient(135deg, ${activeTheme.stroke[0]}, ${activeTheme.stroke[1]})`,
                      boxShadow: `0 4px 16px -4px ${activeTheme.glow[0]}`,
                      color: "white",
                    }
                  : undefined
              }
            >
              {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-foreground"
                >
                  <Paperclip className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <span className="text-muted-foreground/60">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => handleAttachmentRemove(file.id)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
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
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleToolToggle(tool.id)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{
                    borderColor: isActive ? tool.chip.border : tool.chip.idleBorder,
                    background: isActive ? tool.chip.background : tool.chip.idleBackground,
                    boxShadow: isActive ? `0 0 12px -4px ${tool.chip.border}` : undefined,
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
      <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
        Press{" "}
        <kbd className="rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">⌘ Enter</kbd>{" "}
        to send
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
        <div className="rounded-[31px] border border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 md:p-8">
          {hasConversation ? (
            <div className="flex min-h-[70vh] flex-col gap-6">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})`,
                    boxShadow: `0 4px 16px -6px ${activeTheme.glow[0]}`,
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                </div>
                <span className="text-sm font-medium text-foreground/80">Lelwa</span>
                <span className="ml-auto text-[11px] text-muted-foreground/50">
                  {messages.length} message{messages.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col">
                <ScrollArea className="h-[50vh] pr-2">
                  <div className="space-y-5">
                    {messages.map((message) => {
                      const isUser = message.role === "user"
                      const showContext =
                        isUser && ((message.attachments?.length ?? 0) > 0 || (message.tools?.length ?? 0) > 0)
                      return (
                        <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div
                              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})`,
                              }}
                            >
                              <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                            </div>
                          )}
                          <div
                            className={`flex max-w-[80%] flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
                          >
                            {isUser ? (
                              <div className="rounded-2xl rounded-tr-sm bg-muted/60 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                                {message.content}
                              </div>
                            ) : (
                              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                {message.content}
                              </div>
                            )}
                            {showContext && (
                              <div className="flex flex-wrap gap-1.5">
                                {message.tools?.map((tool) => (
                                  <span
                                    key={tool}
                                    className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                                  >
                                    {tool}
                                  </span>
                                ))}
                                {message.attachments?.map((file) => (
                                  <span
                                    key={file.id}
                                    className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                                  >
                                    <Paperclip className="h-2.5 w-2.5" />
                                    {file.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="px-1 text-[10px] text-muted-foreground/40">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {/* Typing indicator */}
                    {isSending && (
                      <div className="flex gap-3 justify-start">
                        <div
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})`,
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-foreground/80" />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/40 px-4 py-3">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "160ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "320ms" }}
                          />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {composer}
            </div>
          ) : (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.glow[0]}, ${activeTheme.glow[1]})`,
                    boxShadow: `0 8px 32px -8px ${activeTheme.glow[0]}`,
                  }}
                >
                  <Sparkles className="h-7 w-7 text-foreground/90" />
                </div>
                <div>
                  <h1 className="font-display text-3xl text-foreground">Lelwa</h1>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    One chat to reply on WhatsApp, call leads, and send offers that close.
                  </p>
                </div>
                {activeTools.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {activeTools.map((toolId) => {
                      const tool = toolOptions.find((t) => t.id === toolId)
                      if (!tool) return null
                      return (
                        <span
                          key={toolId}
                          className="rounded-full border px-3 py-1 text-[11px] font-medium text-foreground"
                          style={{ borderColor: tool.chip.border, background: tool.chip.background }}
                        >
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
  )
}
