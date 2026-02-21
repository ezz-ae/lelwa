"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Home,
  MessageSquare,
  Clock,
  Folder,
  Plug,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AccountMenu } from "./account-menu"

const navItems = [
  { id: "home", label: "Home", href: "/?preview=1", match: "/", icon: Home },
  { id: "studio", label: "Console", href: "/studio", icon: MessageSquare },
  { id: "sessions", label: "Sessions", href: "/sessions", icon: Clock },
  { id: "projects", label: "Projects", href: "/projects", icon: Folder },
  { id: "connect", label: "Connect", href: "/connect", icon: Plug },
]

export function Sidebar() {
  const pathname = usePathname()
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  return (
    <>
      <aside className="flex h-screen w-[72px] shrink-0 flex-col items-center justify-between border-r border-white/10 bg-[hsl(var(--sidebar-background))] py-4 text-[hsl(var(--sidebar-foreground))]">
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/?preview=1"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Go to home"
          >
            <Image src="/icon.svg" alt="Lelwa" width={22} height={22} className="object-contain" />
          </Link>

          <button
            type="button"
            onClick={() => {
              const oldId = window.localStorage.getItem("lelwa_session_id")
              if (oldId) window.localStorage.removeItem(`lelwa_feed_${oldId}`)
              const freshId = `lelwa_${crypto.randomUUID()}`
              window.localStorage.setItem("lelwa_session_id", freshId)
              window.location.href = "/studio"
            }}
            className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="New session"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10">
              <Plus className="h-4 w-4" />
            </div>
            <span>New</span>
          </button>

          <nav className="mt-3 flex flex-col items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.match ? pathname === item.match : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/55 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
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
