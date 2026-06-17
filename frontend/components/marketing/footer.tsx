import Link from "next/link"
import { BRAND } from "@/lib/brand"

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-sky-400 text-xs font-bold text-white">
            {BRAND.name.charAt(0)}
          </span>
          <span className="font-semibold">{BRAND.name}</span>
          <span className="hidden text-sm text-white/40 sm:inline">— {BRAND.tagline}</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/50">
          <Link href="/studio" className="transition-colors hover:text-white">
            For brokers
          </Link>
          <a href={`mailto:${BRAND.email}`} className="transition-colors hover:text-white">
            Contact
          </a>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-white/30 sm:text-left">
        © {new Date().getFullYear()} {BRAND.name}. The AI of Dubai real estate.
      </p>
    </footer>
  )
}
