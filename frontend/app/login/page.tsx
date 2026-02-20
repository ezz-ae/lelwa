"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
        <Card className="relative w-full border border-border/60 bg-gradient-to-br from-[#1A1C22] via-[#14161C] to-[#0F1116] shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <CardContent className="relative z-10 space-y-6 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60">
                <Sparkles className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lelwa</p>
                <p className="text-sm font-semibold text-foreground">Log in</p>
              </div>
            </div>

            <Input
              placeholder="Email or phone"
              className="bg-background/40 border-border/60 text-foreground placeholder:text-muted-foreground"
            />

            <Button className="w-full rounded-full">Send code</Button>

            <Button asChild variant="ghost" className="w-full rounded-full text-muted-foreground hover:bg-muted/40">
              <Link href="/activate">Start with Lelwa</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
