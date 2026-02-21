"use client"

import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Plug,
  Folder,
  Clock,
  LogOut,
} from "lucide-react"

interface AccountMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuSections = [
  {
    label: "Account",
    items: [
      { icon: User, label: "Console", href: "/studio" },
      { icon: Clock, label: "Sessions", href: "/sessions" },
      { icon: Folder, label: "Projects", href: "/projects" },
      { icon: Plug, label: "Connect", href: "/connect" },
    ],
  },
  {
    label: "Support",
    items: [
      { icon: Mail, label: "Support", href: "mailto:hello@lelwa.com" },
    ],
  },
]

export function AccountMenu({ isOpen, onClose }: AccountMenuProps) {
  const router = useRouter()

  if (!isOpen) return null

  function navigate(href: string) {
    onClose()
    if (href.startsWith("mailto:")) {
      window.open(href)
    } else {
      router.push(href)
    }
  }

  function handleLogout() {
    onClose()
    window.localStorage.removeItem("lelwa_user_id")
    window.localStorage.removeItem("lelwa_session_id")
    window.localStorage.removeItem("lelwa_active_project")
    window.localStorage.removeItem("lelwa_sessions")
    router.push("/")
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="fixed bottom-20 left-4 z-50 w-72 overflow-hidden rounded-xl border border-white/10 bg-[hsl(var(--card))] shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-foreground">
              L
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">Lelwa</p>
              <p className="truncate text-[11px] text-muted-foreground">Active · Dubai</p>
            </div>
          </div>
        </div>

        <div className="p-1.5">
          {menuSections.map((section, si) => (
            <div key={section.label}>
              {si > 0 && <div className="my-1 border-t border-white/10" />}
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon
                const href = "href" in item ? item.href : undefined
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (href) navigate(href)
                      else onClose()
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/80 transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}

          <div className="my-1 border-t border-white/10" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  )
}
