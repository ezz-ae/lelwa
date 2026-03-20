"use client"

import Image from "next/image"
import { Film, Image as ImageIcon, Box, UserRound, Headphones } from "lucide-react"

const flows = [
  {
    label: "Create video cutouts",
    variant: "SAM 3",
    icon: Film,
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  },
  {
    label: "Create image cutouts",
    variant: "SAM 3",
    icon: ImageIcon,
    gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
  },
  {
    label: "Create 3D scenes",
    variant: "SAM 3D",
    icon: Box,
    gradient: "linear-gradient(135deg, #0ea5e9, #5eead4)",
  },
  {
    label: "Create 3D bodies",
    variant: "SAM 3D",
    icon: UserRound,
    gradient: "linear-gradient(135deg, #f97316, #fb7185)",
  },
  {
    label: "Isolate sounds",
    variant: "SAM Audio",
    icon: Headphones,
    gradient: "linear-gradient(135deg, #38bdf8, #c084fc)",
  },
]

const templates = [
  {
    title: "Cutout the crew",
    caption: "Hand-selected template for bold motion scenes.",
    image: "/neon-finance-app-interface-dark-mode.jpg",
  },
  {
    title: "Stadium highlight",
    caption: "3D soccer vignette with glow outlines.",
    image: "/meditation-app-interface-soft-gradients.jpg",
  },
  {
    title: "After-hours remix",
    caption: "Animate club footage with neon effects.",
    image: "/space-website-interface-futuristic.jpg",
  },
]

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-6">
        <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/30 px-6 py-8 backdrop-blur">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Segment Anything</p>
            <h1 className="text-4xl font-semibold leading-tight">Playground</h1>
            <p className="text-sm text-white/60">Easy, smart flow for every canvas use case—start from scratch or remix a template.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              About
            </button>
            <button className="rounded-full border border-emerald-400 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Playground
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Flow</p>
            <h2 className="text-3xl font-semibold">Canvas journeys</h2>
            <p className="text-sm text-white/60">Pick a spot on the grid and we’ll route you through the automation.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => {
              const Icon = flow.icon
              return (
                <div
                  key={flow.label}
                  className="flex flex-col justify-between rounded-3xl border border-white/10 px-6 py-8 text-sm text-white shadow-lg shadow-black/60"
                  style={{ background: flow.gradient }}
                >
                  <div className="flex items-center gap-3 text-base font-semibold">
                    <span className="rounded-2xl bg-white/30 p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    {flow.label}
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/70">{flow.variant}</div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Featured templates</p>
            <h2 className="text-3xl font-semibold">Handpicked canvases</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.title}
                className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/70 backdrop-blur"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image src={template.image} alt={template.title} fill className="object-cover" priority />
                </div>
                <div className="flex flex-col gap-1 px-4 py-5">
                  <p className="text-sm font-semibold">{template.title}</p>
                  <p className="text-sm text-white/60">{template.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
