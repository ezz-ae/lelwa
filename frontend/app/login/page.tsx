"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Loader2, Sparkles } from "lucide-react"

type Phase = "form" | "sending" | "sent"

export default function LoginPage() {
  const router = useRouter()
  const [contact, setContact] = useState("")
  const [phase, setPhase] = useState<Phase>("form")
  const [error, setError] = useState<string | null>(null)

  const isValid = contact.trim().length >= 4

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || phase !== "form") return
    setError(null)
    setPhase("sending")

    // Store the contact for the session
    try {
      window.localStorage.setItem("lelwa_login_contact", contact.trim())

      // Simulate code send delay (backend auth not yet wired)
      await new Promise((r) => setTimeout(r, 1200))

      setPhase("sent")

      // Redirect into the app after showing success
      setTimeout(() => {
        router.push("/studio")
      }, 1500)
    } catch {
      setPhase("form")
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
        <Card className="relative w-full border border-border/60 bg-gradient-to-br from-[#1A1C22] via-[#14161C] to-[#0F1116] shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <CardContent className="relative z-10 space-y-6 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lelwa</p>
                <p className="text-sm font-semibold text-foreground">Log in</p>
              </div>
            </div>

            <form onSubmit={handleSendCode} className="space-y-4">
              <Input
                type="text"
                inputMode="email"
                autoComplete="email"
                placeholder="Email or phone"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={phase !== "form"}
                className="bg-background/40 border-border/60 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
              />

              {error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={!isValid || phase !== "form"}
                className="w-full rounded-full"
              >
                {phase === "sending" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending code…</>
                ) : phase === "sent" ? (
                  <><Check className="mr-2 h-4 w-4" />Code sent — opening console</>
                ) : (
                  "Send code"
                )}
              </Button>
            </form>

            {phase === "sent" && (
              <p className="text-center text-xs text-muted-foreground animate-in fade-in duration-300">
                Check your inbox. Redirecting you now…
              </p>
            )}

            <Button asChild variant="ghost" className="w-full rounded-full text-muted-foreground hover:bg-muted/40">
              <Link href="/activate">Start with Lelwa</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
