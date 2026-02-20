"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { actionThemes, neutralActionTheme } from "@/lib/lelwa-actions"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const packages = [
  {
    name: "Lelwa Core",
    actions: ["Run Ads", "Refresh Listing", "Qualify Leads"],
  },
  {
    name: "Lelwa Closer",
    actions: ["Call Leads", "Create Offer", "Create Contract"],
  },
  {
    name: "Lelwa Team",
    actions: ["Run Ads", "Call Leads", "Follow Up", "Review Activity"],
  },
]

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <button
        onClick={onClose}
        className="fixed right-6 top-6 text-muted-foreground hover:text-foreground transition-colors z-10"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Packages</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pack) => (
              <Card key={pack.name} className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border-border/60">
                <CardContent className="space-y-4">
                  <div className="text-lg font-semibold text-foreground">{pack.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {pack.actions.map((action) => {
                      const theme = actionThemes.find((item) => item.label === action) ?? neutralActionTheme
                      return (
                        <span
                          key={action}
                          className="rounded-full border px-3 py-1 text-xs text-foreground"
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
                  <Button className="w-full rounded-full">Select</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
