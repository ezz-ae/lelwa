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
    <div className={cn("flex min-h-screen bg-background", className)}>
      <Sidebar />
      <main className={cn("flex-1 px-6 py-8 md:px-10", mainClassName)}>{children}</main>
    </div>
  )
}
