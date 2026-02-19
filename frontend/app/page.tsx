// This content is from the new chat-interface-design theme, adapted for Lelwa LLM for Real Estate S.
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Clock, Loader2, Send, User, Ship, Search as SearchIcon } from "lucide-react" // Renamed Search to SearchIcon to avoid conflict

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

export default function DashboardPage() {
  // Existing state from LogisticsQuoteInterface
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to Lelwa LLM! I'm here to help you with your real estate inquiries. What are you looking for today?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      role: "user",
      content: "Hi! I need to find properties in Dubai.",
      timestamp: new Date(Date.now() - 240000),
    },
  ]);

  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([
    {
      id: "location",
      label: "Location",
      status: "checked",
      description: "Dubai, UAE",
      category: "Property Search",
    },
    {
      id: "property_type",
      label: "Property Type",
      status: "pending",
      description: "Apartment, Villa, etc.",
      category: "Property Search",
    },
    {
      id: "budget",
      label: "Budget",
      status: "pending",
      description: "Max price range",
      category: "Property Search",
    },
    {
      id: "bedrooms",
      label: "Bedrooms",
      status: "pending",
      description: "Number of bedrooms",
      category: "Property Features",
    },
    {
      id: "amenities",
      label: "Amenities",
      status: "pending",
      description: "Pool, Gym, Parking, etc.",
      category: "Property Features",
    },
  ]);

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

  // Function to update requirements based on message content
  const updateRequirements = (content: string) => {
    setRequiredFields((prevFields) => {
      const newFields = [...prevFields]
      const lowerContent = content.toLowerCase()

      const checkAndUpdate = (fieldId: string, keywords: string[]) => {
        const field = newFields.find((f) => f.id === fieldId)
        if (field && field.status === "pending") {
          if (keywords.some((keyword) => lowerContent.includes(keyword))) {
            field.status = "checked"
          }
        }
      }

      checkAndUpdate("property_type", ["apartment", "villa", "townhouse"])
      checkAndUpdate("budget", ["budget", "price", "aed", "dirham", "usd", "$", "million"])
      checkAndUpdate("bedrooms", ["bedroom", "bed", "br"])
      checkAndUpdate("amenities", ["pool", "gym", "parking", "balcony"])
      
      return newFields
    })
  }

  // Effect to process messages and update requirements
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
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
        content: data.reply || "I couldn't generate a response just now.",
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't reach the Lelwa API. Please check the backend and try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsSending(false)
    }
  }

  const completedCount = requiredFields.filter((field) => field.status === "checked").length
  const totalCount = requiredFields.length
  const progressPercentage = (completedCount / totalCount) * 100

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
    <div className="relative min-h-screen p-8">
      {/* Hero Headline */}
      <div className="relative z-10 text-center mb-16 pt-16">
        <h1 className="text-5xl md:text-7xl font-bold text-foreground drop-shadow-lg leading-tight">
          Find Your <span className="text-primary">Dream Property</span> with AI.
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto opacity-80">
          Leveraging cutting-edge AI for effortless real estate discovery.
        </p>
      </div>

      {/* Floating Search Input */}
      <Card className="relative z-20 mx-auto max-w-2xl p-2 rounded-full shadow-xl bg-card/60 backdrop-blur-lg mb-16">
        <CardContent className="flex items-center space-x-2 px-4 py-2 !p-2">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <Input
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground focus:shadow-lg focus:shadow-primary/30 outline-none"
            placeholder="Search for properties, trends, or insights..."
          />
          <Button size="icon" className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <SearchIcon className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>


      <div className="flex justify-center items-start gap-8 z-20 relative">
        {/* Main Content Area (LogisticsQuoteInterface adapted) */}
        <Card className="flex-1 max-w-4xl p-0 rounded-xl bg-card/60 backdrop-blur-lg shadow-xl relative overflow-hidden">
          {/* Chat Interface - Left Side */}
          <div className="flex-1 flex flex-col h-[70vh]">
            {/* Chat Header */}
            <div className="bg-card/70 border-b border-border/50 p-4 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Ship className="w-4 h-4 text-primary-foreground" /> {/* Changed icon and colors */}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Lelwa Real Estate AI</h1>
                  <p className="text-sm text-muted-foreground">AI Assistant • Find your next property</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-start space-x-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                        }`}
                      >
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Ship className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-card/70 text-foreground border border-border/50"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p
                          className={`text-xs px-2 ${message.role === "user" ? "text-right text-muted-foreground" : "text-muted-foreground"}`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-card/70 border-t border-border/50 p-4 backdrop-blur-sm sticky bottom-0 z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about properties, market trends, or investments..."
                      className="bg-input/60 border-border/50 text-foreground placeholder:text-muted-foreground pr-12 py-3 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-8 w-8 p-0"
                      disabled={isSending || !input.trim()}
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Required Fields Sidebar - Right Side (Adapted for Glassmorphism) */}
        <Card className="w-96 p-0 rounded-xl bg-card/60 backdrop-blur-lg shadow-xl relative overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border/50 bg-card/70">
            <h2 className="text-lg font-semibold text-foreground mb-3">Real Estate Requirements</h2>
            <div className="space-y-2">
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
          </div>

          {/* Fields List */}
          <ScrollArea className="flex-1 p-4 h-[50vh]">
            <div className="space-y-6">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h3>
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <Card
                        key={field.id}
                        className={`transition-all duration-200 border border-border/30 p-3 rounded-lg ${
                          field.status === "checked"
                            ? "bg-primary/20 hover:bg-primary/30"
                            : "bg-input/20 hover:bg-input/30"
                        }`}
                      >
                        <CardContent className="!p-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    field.status === "checked" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {field.status === "checked" ? (
                                    <Check className="w-2.5 h-2.5" />
                                  ) : (
                                    <Clock className="w-2.5 h-2.5" />
                                  )}
                                </div>
                                <h4 className="font-medium text-sm text-foreground">{field.label}</h4>
                              </div>
                              {field.description && (
                                <p className="text-xs text-muted-foreground mt-1 ml-7">{field.description}</p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ml-2 ${
                                field.status === "checked"
                                  ? "bg-primary/30 text-primary-foreground border-primary/20"
                                  : "bg-muted/30 text-muted-foreground border-border/20"
                              }`}
                            >
                              {field.status === "checked" ? "✓" : "○"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/50 bg-card/70">
            <Button
              className={`w-full transition-all duration-200 ${
                completedCount === totalCount
                  ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50"
              }`}
              disabled={completedCount < totalCount}
            >
              {completedCount === totalCount ? (
                <div className="flex items-center space-x-2">
                  <SearchIcon className="w-4 h-4" /> {/* Changed icon */}
                  <span>Search Properties</span>
                </div>
              ) : (
                `${totalCount - completedCount} details needed`
              )}
            </Button>
            {completedCount === totalCount && (
              <p className="text-xs text-muted-foreground text-center mt-2">Click to find your perfect property!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
