"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  ArrowUpRight,
  Check,
  CircleDot,
  Clock,
  Layers,
  Loader2,
  MapPin,
  Send,
  Shield,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface RequiredField {
  id: string
  label: string
  status: "pending" | "checked"
  description?: string
  category: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const signalPillars: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Signal Radar",
    description: "Detect demand swings, launch velocity, and yield pressure in real time.",
    icon: Activity,
  },
  {
    title: "Deal DNA",
    description: "Break down every project into risk bands, price reality, and exit liquidity.",
    icon: Layers,
  },
  {
    title: "Risk Shield",
    description: "Filter portfolios by safety bands before you ever book a viewing.",
    icon: Shield,
  },
]

const pulseStats = [
  {
    label: "Listings scored",
    value: "7.2k",
    detail: "Neon-ranked inventory",
  },
  {
    label: "Avg gross yield",
    value: "6.4%",
    detail: "Prime Dubai 2025",
  },
  {
    label: "Risk bands",
    value: "5",
    detail: "Institutional to speculative",
  },
  {
    label: "Signals tracked",
    value: "24",
    detail: "Demand, supply, timing",
  },
]

const momentumAreas = [
  { name: "Dubai Marina", score: "92", trend: "+4.1%" },
  { name: "Business Bay", score: "89", trend: "+3.3%" },
  { name: "JVC", score: "86", trend: "+2.7%" },
]

export default function DashboardPage() {
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to Lelwa. Share your budget, target area, and timeline to begin.",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "2",
      role: "user",
      content: "Looking for a 2 bed in Dubai Marina under AED 2.5M.",
      timestamp: new Date(Date.now() - 120000),
    },
  ])

  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([
    {
      id: "location",
      label: "Location",
      status: "checked",
      description: "Dubai, UAE",
      category: "Search Profile",
    },
    {
      id: "property_type",
      label: "Property Type",
      status: "pending",
      description: "Apartment, Villa, Townhouse",
      category: "Search Profile",
    },
    {
      id: "budget",
      label: "Budget",
      status: "pending",
      description: "Max price range",
      category: "Search Profile",
    },
    {
      id: "bedrooms",
      label: "Bedrooms",
      status: "pending",
      description: "Number of bedrooms",
      category: "Lifestyle",
    },
    {
      id: "amenities",
      label: "Amenities",
      status: "pending",
      description: "Pool, Gym, Parking",
      category: "Lifestyle",
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

  const updateRequirements = (content: string) => {
    const lowerContent = content.toLowerCase()
    const keywordMap: Record<string, string[]> = {
      property_type: ["apartment", "villa", "townhouse", "penthouse", "studio"],
      budget: ["budget", "price", "aed", "dirham", "usd", "$", "million", "m"],
      bedrooms: ["bedroom", "bed", "br"],
      amenities: ["pool", "gym", "parking", "balcony", "view"],
    }

    setRequiredFields((prevFields) =>
      prevFields.map((field) => {
        if (field.status === "checked") return field
        const keywords = keywordMap[field.id]
        if (keywords && keywords.some((keyword) => lowerContent.includes(keyword))) {
          return { ...field, status: "checked" }
        }
        return field
      })
    )
  }

  useEffect(() => {
    if (messages.length === 0) return
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user") {
      updateRequirements(lastMessage.content)
    }
  }, [messages])

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

  const completedCount = requiredFields.filter((field) => field.status === "checked").length
  const totalCount = requiredFields.length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  const fieldsByCategory = requiredFields.reduce(
    (acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = []
      }
      acc[field.category].push(field)
      return acc
    },
    {} as Record<string, RequiredField[]>
  )

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(16,117,107,0.28),_transparent_65%)] blur-3xl" />
        <div className="absolute -bottom-28 right-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(213,123,54,0.25),_transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.04),_rgba(15,23,42,0))]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Lelwa</p>
            <p className="font-display text-lg text-foreground">Real Estate Intelligence</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" className="rounded-full">
            Book demo
          </Button>
          <Button className="rounded-full">
            Get a briefing
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-12 pb-20 pt-10 space-y-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-background/60 text-muted-foreground">
                Dubai and UAE coverage
              </Badge>
              <Badge className="bg-primary/90 text-primary-foreground">
                Live signal stack
              </Badge>
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-foreground">
              Real estate intelligence that moves before the market does.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Lelwa blends live market signals, risk bands, and investor fit scoring into one command
              center for Dubai property decisions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full" onClick={() => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" })}>
                Enter live studio
              </Button>
              <Button variant="outline" className="rounded-full">
                View signal map
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              {pulseStats.slice(0, 3).map((stat) => (
                <div key={stat.label} className="min-w-[140px]">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {[
                "DLD transactions",
                "Price reality",
                "Yield pressure",
                "Launch velocity",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border/60 bg-background/70 px-3 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-card/80 border-border/60 shadow-2xl shadow-primary/10">
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <CircleDot className="h-3 w-3 text-emerald-500" />
                    Live market pulse
                  </div>
                  <Badge variant="outline" className="bg-background/70">
                    Updated 2 min ago
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pulseStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-semibold text-foreground mt-2">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Momentum leaders</p>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {momentumAreas.map((area) => (
                      <div key={area.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{area.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{area.score}</span>
                          <span className="text-primary font-medium">{area.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-card/70 border-border/60">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Coverage</p>
                  <p className="text-2xl font-semibold text-foreground">34 areas</p>
                  <p className="text-xs text-muted-foreground">Ranked by risk and yield</p>
                </CardContent>
              </Card>
              <Card className="bg-card/70 border-border/60">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Investor fit</p>
                  <p className="text-2xl font-semibold text-foreground">92%</p>
                  <p className="text-xs text-muted-foreground">Avg match confidence</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {signalPillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <Card
                key={pillar.title}
                className={`bg-card/70 border-border/60 animate-in fade-in slide-in-from-bottom-6 duration-700 ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : "delay-300"
                }`}
              >
                <CardContent className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/70 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section id="studio" className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Card className="bg-card/80 border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/60 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live intelligence studio</p>
                  <h2 className="text-xl font-semibold text-foreground">Talk to the market engine</h2>
                </div>
                <Badge variant="outline" className="bg-background/70">
                  Avg response 2.3s
                </Badge>
              </div>

              <div className="flex flex-col h-[55vh] min-h-[420px]">
                <ScrollArea className="flex-1 px-6 py-6">
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`flex items-start space-x-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
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

          <Card className="bg-card/80 border-border/60">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Investor intake</p>
                <h3 className="text-lg font-semibold text-foreground">Signal completeness</h3>
                <p className="text-sm text-muted-foreground mt-1">Fill the gaps to unlock your shortlist.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span className="text-foreground font-medium">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <div className="w-full bg-border/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <div
                          key={field.id}
                          className={`rounded-2xl border border-border/40 p-3 transition-all ${
                            field.status === "checked"
                              ? "bg-primary/15"
                              : "bg-background/60"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                    field.status === "checked" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {field.status === "checked" ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                </div>
                                <h5 className="font-medium text-sm text-foreground">{field.label}</h5>
                              </div>
                              {field.description && (
                                <p className="text-xs text-muted-foreground mt-1 ml-8">{field.description}</p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ml-2 ${
                                field.status === "checked"
                                  ? "bg-primary/20 text-primary-foreground border-primary/20"
                                  : "bg-muted/30 text-muted-foreground border-border/20"
                              }`}
                            >
                              {field.status === "checked" ? "Ready" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full rounded-full ${
                  completedCount === totalCount
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                disabled={completedCount < totalCount}
              >
                {completedCount === totalCount ? "Generate shortlist" : `${totalCount - completedCount} details needed`}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card/70 p-8 md:p-12 backdrop-blur-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ready to move?</p>
              <h3 className="font-display text-3xl text-foreground mt-2">Book a market briefing built for your portfolio.</h3>
              <p className="text-sm text-muted-foreground mt-3 max-w-xl">
                Lelwa merges DLD data, developer performance, and live demand signals into a single plan for your next move.
              </p>
            </div>
            <Button className="rounded-full">
              Request briefing
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
