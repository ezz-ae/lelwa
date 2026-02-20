"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Wrench } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const toolStack = [
  "search_properties",
  "get_area_intelligence",
  "get_project_price_reality",
  "analyze_investment",
  "calculate_mortgage",
  "compare_properties",
  "plan_investment_portfolio",
  "generate_viewing_plan",
  "generate_offer",
  "generate_negotiation_plan",
  "generate_rental_contract",
  "generate_document_pdf",
  "get_market_overview",
  "get_market_regime",
  "get_market_pulse",
  "update_investor_profile",
  "qualify_lead",
  "get_interior_design_advisory",
  "explore_tokenized_assets",
  "update_token_status",
  "send_whatsapp",
  "call_investor",
]

const quickPrompts = [
  "Best yield under 2M in Dubai Marina",
  "Compare Emaar vs Damac in 2025",
  "Capital safe assets with 5%+ yield",
]

const recentActions = [
  "Ranked 12 projects for risk profile: Balanced",
  "Calculated mortgage at 4.5% over 25 years",
  "Generated offer brief PDF",
]

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Intelligence Studio</p>
          <h2 className="font-display text-2xl text-foreground">Market briefing console</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-background/60 text-[11px]">
            Session {sessionId ? sessionId.slice(-6) : "new"}
          </Badge>
          <Badge variant="outline" className="bg-background/60 text-[11px]">
            Tools {toolStack.length}
          </Badge>
          <Badge variant="outline" className="bg-background/60 text-[11px]">
            Avg response 2.3s
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-border/60 bg-card/70">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live transcript</p>
            <span className="text-xs text-muted-foreground">Model: Gemini 2.0 Flash</span>
          </div>
          <ScrollArea className="h-[52vh] min-h-[420px] px-5 py-4">
            <div className="space-y-3 text-sm">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl border border-border/60 bg-background/60 p-3 ${
                    message.role === "user" ? "border-l-2 border-l-primary" : "border-l-2 border-l-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className={message.role === "user" ? "text-primary" : "text-secondary"}>
                      {message.role === "user" ? "Investor" : "Lelwa"}
                    </span>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-2 leading-relaxed text-foreground">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border/60 px-5 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>Command input</span>
                <span>Shift + Enter for new line</span>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about pricing, yields, or risk bands..."
                  className="h-10 rounded-lg bg-background/70 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isSending}
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  className="h-10 rounded-lg px-4"
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Run
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                {quickPrompts.map((prompt) => (
                  <span key={prompt} className="rounded-full border border-border/60 bg-background/70 px-3 py-1">
                    Try: {prompt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tool stack</p>
              <Badge variant="outline" className="bg-background/60 text-[11px]">
                {toolStack.length} tools
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {toolStack.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-border/60 bg-background/70 px-2 py-1 text-[11px] text-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Recent actions</p>
            </div>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              {recentActions.map((action) => (
                <div key={action} className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
