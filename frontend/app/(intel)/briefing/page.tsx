import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, FileText } from "lucide-react"

const briefingItems = [
  "Customized shortlists with risk bands",
  "Price reality vs DLD benchmarks",
  "Yield and cashflow projections",
  "Exit liquidity signals",
]

export default function BriefingPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Briefing</p>
        <h2 className="font-display text-3xl text-foreground">Request a market briefing</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Get a curated report tailored to your budget, risk profile, and timeline.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-card/80 border-border/60">
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Included in your briefing</p>
                <h3 className="text-lg font-semibold text-foreground">Actionable investor dossier</h3>
              </div>
            </div>
            <div className="space-y-3">
              {briefingItems.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-3">
                  <span className="text-sm text-foreground">{item}</span>
                  <Badge variant="outline" className="bg-background/60">Included</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/60">
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Submit request</p>
              <h3 className="text-lg font-semibold text-foreground">Book your briefing</h3>
              <p className="text-sm text-muted-foreground mt-2">
                We respond within 24 hours with a tailored market plan.
              </p>
            </div>
            <div className="space-y-3">
              <Input placeholder="Full name" className="bg-background/70 border-border/60" />
              <Input placeholder="Email address" type="email" className="bg-background/70 border-border/60" />
              <Input placeholder="Target budget (AED)" className="bg-background/70 border-border/60" />
            </div>
            <Button className="rounded-full">
              Request briefing
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
