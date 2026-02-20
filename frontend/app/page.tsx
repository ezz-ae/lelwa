"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { primaryActions } from "@/lib/lelwa-actions"

export default function MarketingLanding() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          Select an operation
        </h1>
        <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
          Each operation prepares your full workspace — reply, script, and documentation.
        </p>

        <div className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {primaryActions.map((tile) => {
            const Icon = tile.icon
            return (
              <Link key={tile.id} href={`/studio?action=${tile.id}`} className="group">
                <div
                  className="h-full rounded-[28px] p-[1px]"
                  style={{
                    background: `linear-gradient(135deg, ${tile.stroke[0]}, ${tile.stroke[1]})`,
                  }}
                >
                  <Card
                    className="h-full border-0 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.7)] transition-transform duration-200 group-hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(140deg, ${tile.glow[0]}, rgba(15, 17, 22, 0.96) 65%), linear-gradient(160deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))`,
                    }}
                  >
                    <CardContent className="flex h-full flex-col items-start gap-6 p-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5"
                        style={{ background: tile.iconBackground }}
                      >
                        <Icon className={`h-6 w-6 ${tile.iconClass}`} />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{tile.label}</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
