import type { ReactNode } from "react"
import { Sidebar } from "@/app/components/sidebar"

export default function IntelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-6 pb-16 pt-10 md:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
