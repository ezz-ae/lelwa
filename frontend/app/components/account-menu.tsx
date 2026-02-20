"use client"

import { useRouter } from "next/navigation"
import {
  User,
  Settings,
  ToggleLeft,
  Mail,
  Keyboard,
  Calendar,
  Bell,
  Plug,
  Gem,
  Settings2,
  Check,
  HelpCircle,
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
      { icon: User, label: "Account", href: "/activate" },
      { icon: Settings2, label: "Preferences", href: "/activate" },
      { icon: ToggleLeft, label: "Personalization", href: "/activate" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: Keyboard, label: "Shortcuts", href: "/studio" },
      { icon: Calendar, label: "Tasks", href: "/studio" },
      { icon: Bell, label: "Notifications", href: "/briefing" },
      { icon: Plug, label: "Connections", href: "/connect" },
    ],
  },
  {
    label: "Support",
    items: [
      { icon: Mail, label: "Support", href: "mailto:hello@lelwa.com" },
      { icon: Gem, label: "Packages", action: "upgrade" as const },
      { icon: Settings, label: "All settings", href: "/connect" },
    ],
  },
]

const profiles = [
  { name: "Lelwa User", initials: "L", active: true, gradient: "from-violet-500/40 to-indigo-500/30" },
  { name: "Incognito", initials: "🕶️", active: false, gradient: "from-zinc-600/30 to-zinc-700/20" },
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
    window.localStorage.removeItem("lelwa_session_id")
    window.localStorage.removeItem("lelwa_strategy_profile")
    window.localStorage.removeItem("lelwa_strategy_actions")
    window.localStorage.removeItem("lelwa_login_contact")
    router.push("/login")
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="fixed bottom-20 left-4 z-50 w-72 overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl shadow-black/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* User header */}
        <div className="border-b border-border/60 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-500/30 text-sm font-bold text-foreground/90 ring-1 ring-white/10">
              L
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">Lelwa User</p>
              <p className="truncate text-[11px] text-muted-foreground">Active · Dubai</p>
            </div>
          </div>
        </div>

        {/* Menu sections */}
        <div className="p-1.5">
          {menuSections.map((section, si) => (
            <div key={section.label}>
              {si > 0 && <div className="my-1 border-t border-border/40" />}
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">
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
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}

          <div className="my-1 border-t border-border/40" />

          {/* Profile switcher */}
          {profiles.map((profile) => (
            <button
              key={profile.name}
              onClick={onClose}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold ring-1 ring-white/10 ${profile.gradient}`}
              >
                {profile.initials}
              </span>
              <span className="flex-1 text-left text-foreground/80">{profile.name}</span>
              {profile.active ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              ) : (
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              )}
            </button>
          ))}

          <div className="my-1 border-t border-border/40" />

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
