"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2, Check } from "lucide-react"

interface ConnectField {
  key: string
  type: "text" | "password" | "tel"
  label: string
}

interface ConnectSheetProps {
  isOpen: boolean
  channel: "whatsapp" | "voice" | string
  prompt: string
  fields: ConnectField[]
  resume?: { tool_name: string; args: Record<string, unknown> }
  onClose: () => void
  onConnected: () => void
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  voice: "Voice calls",
}

export function ConnectSheet({
  isOpen,
  channel,
  prompt,
  fields,
  onClose,
  onConnected,
}: ConnectSheetProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const channelLabel = CHANNEL_LABELS[channel] ?? channel

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      const res = await fetch(`${apiBase}/v1/channels/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, config: values, user_id: "default" }),
      })
      if (!res.ok) throw new Error(await res.text())
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setValues({})
        onConnected()
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-t-3xl border border-border/60 bg-card p-6 shadow-2xl shadow-black/40 animate-in slide-in-from-bottom-4 duration-200 sm:rounded-3xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <div className="mb-5 pr-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Connect · {channelLabel}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{prompt}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Credentials are stored locally and never shared.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
              <input
                type={field.type}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                required
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-border focus:outline-none focus:ring-0 transition"
              />
            </div>
          ))}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || done}
            className="mt-1 w-full rounded-full"
          >
            {done ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Connected
              </>
            ) : loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              `Connect ${channelLabel}`
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
