"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Home, MessageSquare, Plus, Plug } from "lucide-react"
import { cn } from "@/lib/utils"
import { AccountMenu } from "./account-menu"

const navItems = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "studio", label: "Console", href: "/studio", icon: MessageSquare },
  { id: "connect", label: "Connect", href: "/connect", icon: Plug },
]

export function Sidebar() {
  const pathname = usePathname()
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  return (
    <>
      <aside className="flex h-screen w-[88px] shrink-0 flex-col items-center border-r border-border/60 bg-background py-4">
        {/* Logo + New chat */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-colors hover:bg-muted/80"
            aria-label="Go to home"
          >
            <Image src="/icon.svg" alt="Lelwa" width={26} height={26} className="object-contain" />
          </Link>

          <button
            type="button"
            onClick={() => {
              // Generate a fresh session so the studio starts clean
              const freshId = `lelwa_${crypto.randomUUID()}`
              window.localStorage.setItem("lelwa_session_id", freshId)
              window.location.href = "/studio"
            }}
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            aria-label="New chat"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-muted/30">
              <Plus className="h-4 w-4" />
            </div>
            <span>New chat</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-foreground/60" />
                )}
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-xs font-bold text-foreground/80 ring-1 ring-white/10">
              L
            </span>
            <span>Account</span>
          </button>

        </div>
      </aside>

      <AccountMenu isOpen={showAccountMenu} onClose={() => setShowAccountMenu(false)} />
    </>
  )
}
