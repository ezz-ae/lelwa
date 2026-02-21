import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: ReactNode
  className?: string
  mainClassName?: string
}

export function AppShell({ children, className, mainClassName }: AppShellProps) {
  return (
    <div className={cn("dark min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]", className)}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className={cn("flex-1 overflow-hidden console-bg", mainClassName)}>{children}</main>
      </div>
    </div>
  )
}
