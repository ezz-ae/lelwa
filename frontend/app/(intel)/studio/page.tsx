"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function StudioPage() {
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to Lelwa Studio. Share your budget, target area, and timeline to begin.",
      timestamp: new Date(Date.now() - 180000),
    },
  ])

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

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
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
          message: trimmed,
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
        content: "Sorry, I could not reach the Lelwa API. Please check the backend and try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Intelligence Studio</p>
          <h2 className="font-display text-3xl text-foreground">Market briefing console</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-background/60">
            Session {sessionId ? sessionId.slice(-6) : "new"}
          </Badge>
          <Badge variant="outline" className="bg-background/60">
            Avg response 2.3s
          </Badge>
        </div>
      </div>

      <Card className="bg-card/80 border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-col h-[65vh] min-h-[520px]">
            <ScrollArea className="flex-1 px-6 py-6">
              <div className="mx-auto w-full max-w-3xl space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl border border-border/60 bg-card/70 p-4 ${
                      message.role === "user" ? "border-l-4 border-l-primary bg-primary/5" : "border-l-4 border-l-secondary"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span className={message.role === "user" ? "text-primary" : "text-secondary"}>
                        {message.role === "user" ? "Investor request" : "Lelwa analysis"}
                      </span>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground">{message.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 p-5">
              <div className="mx-auto w-full max-w-3xl">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Request</p>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about yield, pricing, or where to buy next..."
                      className="mt-2 bg-background/70 border-border/60 text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      disabled={isSending}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    size="lg"
                    className="rounded-xl px-6"
                    disabled={isSending || !input.trim()}
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Run analysis
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {[
                    '\"Best yield under 2M in Dubai Marina\"',
                    '\"Compare Emaar vs Damac\"',
                    '\"Capital safe assets with 5%+ yield\"',
                  ].map((example) => (
                    <span
                      key={example}
                      className="rounded-full border border-border/60 bg-background/70 px-3 py-1"
                    >
                      Try: {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
