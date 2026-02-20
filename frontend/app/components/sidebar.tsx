"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { ArrowUpFromDot, CheckCircle2, Home, MessageSquare, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { UpgradeModal } from "./upgrade-modal"
import { AccountMenu } from "./account-menu"

const navItems = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "studio", label: "Chat", href: "/studio", icon: MessageSquare },
  { id: "results", label: "Results", href: "/briefing", icon: CheckCircle2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  return (
    <>
      <aside className="flex h-screen w-[96px] flex-col items-center border-r border-border bg-background py-4">
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40 text-foreground"
            aria-label="Go to home"
          >
            <Image src="/icon.svg" alt="Lelwa" width={28} height={28} className="object-contain" />
          </Link>

          <Link
            href="/studio"
            className="flex flex-col items-center gap-1 rounded-xl bg-muted/40 px-2 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
            <span>New chat</span>
          </Link>
        </div>

        <nav className="mt-6 flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-col items-center gap-3 pb-2">
          <button
            type="button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50">
              <Image src="/icon.svg" alt="Profile" width={28} height={28} className="object-contain" />
            </span>
            <span>Account</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
          >
            <ArrowUpFromDot className="h-5 w-5" />
            <span>Packages</span>
          </button>
        </div>
      </aside>

      <AccountMenu isOpen={showAccountMenu} onClose={() => setShowAccountMenu(false)} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}
