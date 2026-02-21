import type { ReactNode } from "react"
import { AppShell } from "../components/app-shell"

export default function IntelLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell mainClassName="p-0">
      {children}
    </AppShell>
  )
}
