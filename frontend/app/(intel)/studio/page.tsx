"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Sparkles, User } from "lucide-react"

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
          <h2 className="font-display text-3xl text-foreground">Talk to the market engine</h2>
        </div>
        <Badge variant="outline" className="bg-background/60">
          Avg response 2.3s
        </Badge>
      </div>

      <Card className="bg-card/80 border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-col h-[65vh] min-h-[520px]">
            <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-start space-x-3 max-w-[85%] ${
                        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
                        }`}
                      >
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background/70 text-foreground border border-border/60"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p
                          className={`text-xs px-2 ${
                            message.role === "user" ? "text-right text-muted-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 p-4">
              <div className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about yield, pricing, or where to buy next..."
                  className="bg-background/70 border-border/60 text-foreground placeholder:text-muted-foreground pr-12 py-3 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isSending}
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0"
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
