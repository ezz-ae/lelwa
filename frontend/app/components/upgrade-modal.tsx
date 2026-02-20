"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface Package {
  id: string
  name: string
  price: string
  isRecommended?: boolean
  cta: string
  features: string[]
}

const PACKAGES: Package[] = [
  {
    id: "core",
    name: "Core",
    price: "AED 299 / mo",
    cta: "Activate Core",
    features: [
      "WhatsApp & Voice channels",
      "Lead replies and call scripts",
      "Offer sheets and contracts",
      "Single operator",
    ],
  },
  {
    id: "closer",
    name: "Closer",
    price: "AED 499 / mo",
    isRecommended: true,
    cta: "Activate Closer",
    features: [
      "All Core features",
      "Instagram, Facebook, Email",
      "Listing portal submissions",
      "Follow-up sequences",
      "2 operators",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "Custom",
    cta: "Contact Sales",
    features: [
      "All Closer features",
      "Unlimited operators",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
]

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!isOpen) return null

  function handleSelect(pkg: Package) {
    setSelected(pkg.id)
    window.localStorage.setItem(
      "lelwa_strategy_actions",
      JSON.stringify(["reply", "call", "offer", "listing"])
    )
    setTimeout(() => {
      onClose()
      window.location.href = "/studio"
    }, 400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-border/60 bg-card p-6 shadow-2xl shadow-black/40 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Packages</p>
          <h2 className="font-display text-2xl text-foreground">Select a package</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => handleSelect(pkg)}
              className={`group relative flex flex-col gap-4 rounded-2xl border p-4 text-left transition-all ${
                selected === pkg.id
                  ? "border-foreground/40 bg-accent"
                  : pkg.isRecommended
                    ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60"
                    : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
              }`}
            >
              {pkg.isRecommended && (
                <span className="absolute right-3 top-3 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-amber-400">
                  Recommended
                </span>
              )}
              <div>
                <h3 className="text-sm font-semibold text-foreground">{pkg.name}</h3>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{pkg.price}</p>
              </div>
              <ul className="flex-1 space-y-1.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className={`mt-1 block w-full rounded-full py-2 text-center text-xs font-medium transition-colors ${
                selected === pkg.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 bg-muted/30 text-foreground group-hover:bg-muted"
              }`}>
                {pkg.cta}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground/60">
          All packages activate immediately. Contact your account manager for enterprise pricing.
        </p>
      </div>
    </div>
  )
}
