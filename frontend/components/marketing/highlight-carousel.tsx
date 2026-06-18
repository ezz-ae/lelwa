"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const CARDS = [
  {
    tag: "LEAD REPLY",
    title: "Turn a new lead into a ready WhatsApp reply and call script",
    href: "/workflow?template=lead-reply",
  },
  {
    tag: "LISTING LAUNCH",
    title: "Listing details into a description, an ad caption, and a viewing plan",
    href: "/workflow?template=listing-launch",
  },
  {
    tag: "OFFER & CLOSE",
    title: "Buyer terms into an offer summary, a contract outline, and a closing call",
    href: "/workflow?template=offer-close",
  },
  {
    tag: "FOLLOW-UP",
    title: "A sequenced set of follow-ups and meeting nudges that keep a deal moving",
    href: "/workflow?template=follow-up",
  },
]

export function HighlightCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollBy = (direction: number) => {
    trackRef.current?.scrollBy({ left: direction * 372, behavior: "smooth" })
  }

  return (
    <section className="relative px-6 pb-6">
      <div className="mx-auto max-w-7xl">
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CARDS.map((card) => (
            <Link
              key={card.tag}
              href={card.href}
              className="group relative flex h-64 w-[340px] flex-shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-6 transition-colors hover:border-white/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="relative mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
                {card.tag}
              </p>
              <p className="relative text-xl font-semibold leading-snug text-white">{card.title}</p>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
