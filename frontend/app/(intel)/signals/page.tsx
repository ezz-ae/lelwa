import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Layers, Radar, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const signalPillars: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Signal Radar",
    description: "Detect demand swings, launch velocity, and yield pressure in real time.",
    icon: Radar,
  },
  {
    title: "Deal DNA",
    description: "Break down every project into risk bands, price reality, and exit liquidity.",
    icon: Layers,
  },
  {
    title: "Risk Shield",
    description: "Filter portfolios by safety bands before you ever book a viewing.",
    icon: Shield,
  },
]

const signalStack = [
  { label: "DLD transactions", value: "Live" },
  { label: "Developer reliability", value: "Tiered" },
  { label: "Demand pressure", value: "92" },
  { label: "Launch velocity", value: "High" },
  { label: "Liquidity risk", value: "Moderate" },
  { label: "Price reality", value: "Underpriced" },
]

export default function SignalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signals</p>
        <h2 className="font-display text-3xl text-foreground">Every signal in one stack</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Lelwa fuses transactional data, developer intelligence, and market timing into a single live layer.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {signalPillars.map((pillar) => {
          const Icon = pillar.icon
          return (
            <Card key={pillar.title} className="bg-card/80 border-border/60">
              <CardContent className="space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/70 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-card/80 border-border/60">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signal stack</p>
              <h3 className="text-lg font-semibold text-foreground">Live intelligence feed</h3>
            </div>
            <Badge variant="outline" className="bg-background/60">
              24 active signals
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signalStack.map((signal) => (
              <div key={signal.label} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{signal.label}</p>
                <p className="text-lg font-semibold text-foreground mt-2">{signal.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Live signals refresh every 90 seconds.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
