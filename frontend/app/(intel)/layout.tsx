import type { ReactNode } from "react"

export default function IntelLayout({ children }: { children: ReactNode }) {
  return <div className="dark min-h-screen bg-background text-foreground">{children}</div>
}
