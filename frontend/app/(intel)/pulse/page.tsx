import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, TrendingUp } from "lucide-react"

const pulseStats = [
  { label: "Listings scored", value: "7.2k", detail: "Neon-ranked inventory" },
  { label: "Avg gross yield", value: "6.4%", detail: "Prime Dubai 2025" },
  { label: "Risk bands", value: "5", detail: "Institutional to speculative" },
  { label: "Signals tracked", value: "24", detail: "Demand, supply, timing" },
]

const momentumAreas = [
  { name: "Dubai Marina", score: "92", trend: "+4.1%" },
  { name: "Business Bay", score: "89", trend: "+3.3%" },
  { name: "JVC", score: "86", trend: "+2.7%" },
  { name: "Creek Harbour", score: "84", trend: "+2.2%" },
]

const regimeSignals = [
  { label: "Transaction velocity", value: "Bullish" },
  { label: "Launch rate", value: "High energy" },
  { label: "Demand intensity", value: "92" },
  { label: "Construction rate", value: "312" },
  { label: "Handover traffic", value: "4,850" },
  { label: "Seasonal position", value: "Peak inflow" },
]

export default function PulsePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Market Pulse</p>
          <h2 className="font-display text-3xl text-foreground">Dubai signal overview</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Live regime status, growth momentum, and yield pressure across core districts.
          </p>
        </div>
        <Badge variant="outline" className="bg-background/60">
          Updated 2 minutes ago
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pulseStats.map((stat) => (
          <Card key={stat.label} className="bg-card/80 border-border/60">
            <CardContent className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-card/80 border-border/60">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Momentum leaders</p>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
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
            <Button variant="outline" className="rounded-full border-border/60">View full heatmap</Button>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/60">
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Regime signals</p>
              <h3 className="text-lg font-semibold text-foreground">Institutional safe</h3>
            </div>
            <div className="grid gap-3">
              {regimeSignals.map((signal) => (
                <div key={signal.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{signal.label}</span>
                  <span className="text-foreground font-medium">{signal.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm">
              <p className="text-muted-foreground">Directive</p>
              <p className="text-foreground font-medium">Accelerate in capital safe zones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
