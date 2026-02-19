import type { ReactNode } from "react"
import { IntelHeader } from "@/app/components/intel-header"

export default function IntelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <IntelHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 md:px-10">{children}</main>
    </div>
  )
}
