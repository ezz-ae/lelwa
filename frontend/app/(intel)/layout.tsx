import type { ReactNode } from "react"
import { Sidebar } from "@/app/components/sidebar"
import { IntelHeader } from "@/app/components/intel-header"

export default function IntelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <IntelHeader />
        <main className="flex-1 px-6 pb-16 pt-8 md:px-10">{children}</main>
      </div>
    </div>
  )
}
