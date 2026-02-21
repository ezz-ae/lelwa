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
  channel: string
  prompt: string
  fields: ConnectField[]
  /** When present, the sheet calls /v1/actions/resume after saving credentials. */
  resumeToken?: string
  onClose: () => void
  /** Called with the resume result (if any) after the full flow completes. */
  onConnected: (resumeResult?: Record<string, unknown>) => void
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  voice: "Voice",
  instagram: "Instagram",
  facebook: "Facebook",
  email: "Email",
  portals: "Listing Portals",
}

export function ConnectSheet({
  isOpen,
  channel,
  prompt,
  fields,
  resumeToken,
  onClose,
  onConnected,
}: ConnectSheetProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<"form" | "saving" | "resuming" | "done">("form")
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
  const channelLabel = CHANNEL_LABELS[channel] ?? channel

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPhase("saving")

    try {
      // Step 1 — save credentials
      const saveRes = await fetch(`${apiBase}/v1/channels/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, config: values, user_id: "default" }),
      })
      if (!saveRes.ok) throw new Error(await saveRes.text())

      // Step 2 — resume the pending action (if token provided)
      if (resumeToken) {
        setPhase("resuming")
        const resumeRes = await fetch(`${apiBase}/v1/actions/resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_token: resumeToken }),
        })
        const resumeData = await resumeRes.json()

        if (!resumeRes.ok || resumeData.status === "still_blocked") {
          throw new Error("Unavailable")
        }

        setPhase("done")
        setTimeout(() => {
          setPhase("form")
          setValues({})
          onConnected(resumeData)
        }, 700)
      } else {
        setPhase("done")
        setTimeout(() => {
          setPhase("form")
          setValues({})
          onConnected()
        }, 700)
      }
    } catch (err) {
      setPhase("form")
      setError(err instanceof Error ? err.message : "Unavailable")
    }
  }

  const loading = phase === "saving" || phase === "resuming"
  const done = phase === "done"
  const buttonLabel =
    done ? "Done"
    : phase === "resuming" ? "Sending…"
    : phase === "saving" ? "Saving…"
    : `Connect ${channelLabel}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[hsl(var(--card))] p-6 shadow-2xl shadow-black/40 animate-in slide-in-from-bottom-4 duration-200 sm:rounded-3xl">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:opacity-40"
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
          <p className="mt-1 text-xs text-muted-foreground">Not connected</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {field.label}
              </label>
              <input
                type={field.type}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                required
                disabled={loading || done}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-white/20 focus:outline-none transition disabled:opacity-50"
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
              <><Check className="mr-2 h-4 w-4" />{buttonLabel}</>
            ) : loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{buttonLabel}</>
            ) : (
              buttonLabel
            )}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
            Stored locally. Never transmitted to third parties.
          </p>
        </form>
      </div>
    </div>
  )
}
