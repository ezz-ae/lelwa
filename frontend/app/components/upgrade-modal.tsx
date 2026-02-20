"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Gem, Loader2, X } from "lucide-react"
import { actionThemes, neutralActionTheme } from "@/lib/lelwa-actions"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const packages = [
  {
    name: "Lelwa Core",
    tagline: "For independent brokers",
    actions: ["Run Ads", "Refresh Listing", "Qualify Leads"],
    features: [
      "Refresh listings weekly",
      "Qualify inbound leads instantly",
      "Launch targeted ad copy in one click",
      "Up to 50 leads / month",
    ],
    recommended: false,
    cta: "Get Core",
    activateActions: ["run-ads", "refresh-listing", "qualify-leads"],
  },
  {
    name: "Lelwa Closer",
    tagline: "For deal-focused brokers",
    actions: ["Call Leads", "Create Offer", "Create Contract"],
    features: [
      "Voice calls to warm leads",
      "Offer packs prepared in seconds",
      "Contracts drafted, ready to send",
      "Up to 200 leads / month",
      "Priority support",
    ],
    recommended: true,
    cta: "Get Closer",
    activateActions: ["calls", "create-offer", "create-contract"],
  },
  {
    name: "Lelwa Team",
    tagline: "For brokerages",
    actions: ["Run Ads", "Call Leads", "Follow Up", "Review Activity"],
    features: [
      "Everything in Closer",
      "Team activity dashboard",
      "Multi-desk routing",
      "Unlimited leads",
      "Dedicated account manager",
    ],
    recommended: false,
    cta: "Contact Sales",
    activateActions: [] as string[],
  },
]

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  if (!isOpen) return null

  function handleSelect(pack: typeof packages[number]) {
    if (pack.cta === "Contact Sales") {
      window.open("mailto:hello@lelwa.com?subject=Lelwa Team — interest", "_blank")
      return
    }

    setSelected(pack.name)

    // Store selected actions and redirect to studio
    if (pack.activateActions.length > 0) {
      window.localStorage.setItem(
        "lelwa_strategy_actions",
        JSON.stringify(pack.activateActions),
      )
    }
    window.localStorage.setItem("lelwa_package", pack.name)

    setTimeout(() => {
      setSelected(null)
      onClose()
      router.push("/studio")
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 ring-1 ring-white/10">
              <Gem className="h-6 w-6 text-foreground/80" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Packages</p>
              <h2 className="font-display text-3xl text-foreground">Pick your plan</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with the actions you need. Upgrade anytime.
              </p>
            </div>
          </div>

          {/* Package cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pack) => {
              const isSelected = selected === pack.name
              return (
                <Card
                  key={pack.name}
                  className={`relative border bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all ${
                    pack.recommended
                      ? "border-violet-500/40 shadow-lg shadow-violet-500/10"
                      : "border-border/60"
                  }`}
                >
                  {pack.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full border border-violet-500/40 bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                        Most popular
                      </span>
                    </div>
                  )}
                  <CardContent className="space-y-5 pt-6">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{pack.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{pack.tagline}</p>
                    </div>

                    {/* Action chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {pack.actions.map((action) => {
                        const theme = actionThemes.find((item) => item.label === action) ?? neutralActionTheme
                        return (
                          <span
                            key={action}
                            className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                            style={{
                              borderColor: theme.chip.border,
                              background: theme.chip.background,
                            }}
                          >
                            {action}
                          </span>
                        )
                      })}
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-2">
                      {pack.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full rounded-full"
                      variant={pack.recommended ? "default" : "outline"}
                      disabled={isSelected}
                      onClick={() => handleSelect(pack)}
                    >
                      {isSelected ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening console…</>
                      ) : (
                        pack.cta
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <p className="text-center text-[12px] text-muted-foreground/60">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </div>
  )
}
