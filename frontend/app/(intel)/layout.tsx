import type { ReactNode } from "react"
import { AppShell } from "../components/app-shell"

export default function IntelLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell mainClassName="px-6 pb-16 pt-10 md:px-10">
      {children}
    </AppShell>
  )
}
