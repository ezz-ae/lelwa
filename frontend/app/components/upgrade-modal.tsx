"use client"

import { useRouter } from "next/navigation"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const packages = [
  {
    name: "Lelwa Core",
    tagline: "Independent brokers",
    price: "299",
    features: [
      "Listing refresh on demand",
      "Lead qualification on each submission",
      "Ad copy prepared for immediate publication",
      "Up to 50 leads / month",
    ],
    recommended: false,
    cta: "Activate Core",
    activateActions: ["run-ads", "refresh-listing", "qualify-leads"],
  },
  {
    name: "Lelwa Closer",
    tagline: "Deal-focused brokers",
    price: "499",
    features: [
      "Outbound voice calls to qualified leads",
      "Offer documentation prepared per submission",
      "Contracts drafted and ready to send",
      "Up to 200 leads / month",
      "Priority account support",
    ],
    recommended: true,
    cta: "Activate Closer",
    activateActions: ["calls", "create-offer", "create-contract"],
  },
  {
    name: "Lelwa Team",
    tagline: "Brokerages",
    price: "Custom",
    features: [
      "All Closer operations included",
      "Team activity dashboard",
      "Multi-desk routing",
      "Unlimited lead volume",
      "Dedicated account manager",
    ],
    recommended: false,
    cta: "Contact Sales",
    activateActions: [] as string[],
  },
]

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  function handleSelect(pkg: (typeof packages)[number]) {
    if (pkg.activateActions.length === 0) {
      window.location.href = "mailto:hello@lelwa.com?subject=Lelwa Team Package"
      return
    }
    window.localStorage.setItem("lelwa_strategy_actions", JSON.stringify(pkg.activateActions))
    onClose()
    router.push("/studio")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl rounded-3xl border border-border/60 bg-card p-6 shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Packages</p>
          <h2 className="font-display text-3xl text-foreground">Select a package</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the operations relevant to your volume and deal type.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col rounded-2xl border p-5 ${
                pkg.recommended
                  ? "border-foreground/30 bg-gradient-to-br from-white/10 to-white/5"
                  : "border-border/60 bg-gradient-to-br from-white/5 to-transparent"
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-foreground/20 bg-foreground px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                  Recommended
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground">{pkg.tagline}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  {pkg.price === "Custom" ? (
                    <span className="text-2xl font-bold text-foreground">Custom</span>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">AED</span>
                      <span className="text-2xl font-bold text-foreground">{pkg.price}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="mb-5 flex-1 space-y-2">
                {pkg.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full rounded-full"
                variant={pkg.recommended ? "default" : "outline"}
                onClick={() => handleSelect(pkg)}
              >
                {pkg.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[12px] text-muted-foreground/60">
          All packages activate immediately. Contact your account manager for enterprise pricing.
        </p>
      </div>
    </div>
  )
}
