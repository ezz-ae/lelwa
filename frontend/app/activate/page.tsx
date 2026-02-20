"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Sparkles } from "lucide-react"
import { chatActions } from "@/lib/lelwa-actions"

const roles = ["Sales Agent", "Broker", "Investor", "Owner", "Team"]

const callLeadOptions = [
  "Existing data",
  "New inbound leads",
  "Leads from listings",
  "Leads we source together",
]

export default function ActivatePage() {
  const searchParams = useSearchParams()
  const actionFromUrl = searchParams.get("action")
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<string | null>(null)
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [callType, setCallType] = useState<string | null>(null)

  useEffect(() => {
    if (!actionFromUrl) return
    const isValid = chatActions.some((cap) => cap.id === actionFromUrl)
    if (isValid) {
      setCapabilities((prev) => (prev.includes(actionFromUrl) ? prev : [...prev, actionFromUrl]))
    }
  }, [actionFromUrl])

  useEffect(() => {
    const payload = {
      role,
      capabilities,
      callType,
    }
    window.localStorage.setItem("lelwa_strategy_profile", JSON.stringify(payload))
    window.localStorage.setItem("lelwa_strategy_actions", JSON.stringify(capabilities))
  }, [role, capabilities, callType])

  const selectedCapabilities = useMemo(() => {
    return chatActions.filter((cap) => capabilities.includes(cap.id))
  }, [capabilities])

  const needsCallType = capabilities.includes("calls")
  const canContinue =
    step === 1 ? Boolean(role) : step === 2 ? capabilities.length > 0 && (!needsCallType || Boolean(callType)) : true

  const handleCapabilityToggle = (id: string) => {
    setCapabilities((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="relative rounded-[32px] border border-border/60 bg-gradient-to-br from-[#1A1C22] via-[#14161C] to-[#0F1116] p-6 shadow-2xl shadow-black/40 md:p-10">
          <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />

          <div className="relative z-10">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60">
                  <Sparkles className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lelwa</p>
                  <p className="text-sm font-semibold text-foreground">Setup</p>
                </div>
              </div>
              <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:bg-muted/40">
                <Link href="/login">Log in</Link>
              </Button>
            </header>

            <div className="mt-10 space-y-8">
              {step === 1 && (
                <div className="space-y-5">
                  <h1 className="font-display text-2xl text-foreground">Who should Lelwa operate for?</h1>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRole(item)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          role === item
                            ? "border-foreground/30 bg-foreground/10 text-foreground"
                            : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl text-foreground">What should I handle first?</h2>
                  </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {chatActions.map((cap) => {
                    const isSelected = capabilities.includes(cap.id)
                    return (
                      <div
                        key={cap.id}
                        className="rounded-2xl p-[1px]"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${cap.stroke[0]}, ${cap.stroke[1]})`
                            : "linear-gradient(135deg, rgba(148, 163, 184, 0.35), rgba(148, 163, 184, 0.08))",
                        }}
                      >
                        <Card
                          className="cursor-pointer border-0"
                          onClick={() => handleCapabilityToggle(cap.id)}
                          style={{
                            background: isSelected
                              ? `linear-gradient(140deg, ${cap.glow[0]}, rgba(15, 17, 22, 0.96) 70%), linear-gradient(160deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))`
                              : "linear-gradient(160deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))",
                          }}
                        >
                          <CardContent className="flex items-center justify-between gap-4 p-4">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  background: cap.stroke[0],
                                  boxShadow: `0 0 12px ${cap.glow[0]}`,
                                }}
                              />
                              <span className="text-sm font-medium text-foreground">{cap.label}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-foreground/70" />}
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>

                  {needsCallType && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        What type of leads should I call for you?
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {callLeadOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setCallType(option)}
                            className={`rounded-full border px-4 py-2 text-xs transition ${
                              callType === option
                                ? "border-foreground/30 bg-foreground/10 text-foreground"
                                : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl text-foreground">Ready to start</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Your setup is saved. Open the console to begin.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                      <CardContent className="space-y-3 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Role</p>
                        <p className="text-sm font-semibold text-foreground">{role ?? ""}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                      <CardContent className="space-y-3 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Actions</p>
                        <div className="flex flex-wrap gap-2">
                        {selectedCapabilities.map((cap) => (
                          <span
                            key={cap.id}
                            className="rounded-full border px-3 py-1 text-xs text-foreground"
                            style={{
                              borderColor: cap.chip.border,
                              background: cap.chip.background,
                            }}
                          >
                            {cap.label}
                          </span>
                        ))}
                        </div>
                      </CardContent>
                    </Card>
                    {callType && (
                      <Card className="border-border/60 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                        <CardContent className="space-y-3 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Call Leads</p>
                          <p className="text-sm font-semibold text-foreground">{callType}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="ghost"
                className="rounded-full text-muted-foreground hover:bg-muted/40"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1}
              >
                Back
              </Button>
              {step < 3 ? (
                <Button className="rounded-full" onClick={() => setStep((prev) => prev + 1)} disabled={!canContinue}>
                  Continue
                </Button>
              ) : (
                <Button asChild className="rounded-full">
                  <Link href="/studio">Start chat</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
