"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/pulse", label: "Pulse" },
  { href: "/signals", label: "Signals" },
  { href: "/studio", label: "Studio" },
  { href: "/intake", label: "Intake" },
  { href: "/briefing", label: "Briefing" },
]

export function IntelHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lelwa Intelligence</p>
          <h1 className="font-display text-xl text-foreground">Market Command Center</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn("rounded-full", active ? "" : "border-border/60")}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          })}
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/">Marketing</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
