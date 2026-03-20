"use client"

import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { WORKFLOW_TEMPLATES } from "@/lib/workflow-templates"

export function ReadyWorkflows() {
  const featured = WORKFLOW_TEMPLATES.filter((template) => template.id !== "blank")

  return (
    <section id="workflows" className="relative py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Workflows</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready-to-launch automations</h2>
            <p className="text-white/70 max-w-2xl mt-2 text-sm md:text-base">
              Pick a proven workflow, customize the prompts, and run a full sequence in minutes. Every step mirrors what you already do to close deals.
            </p>
          </div>
          <Link
            href="/workflow"
            className="rounded-full border border-white/30 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white/60"
          >
            View all
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((template) => {
            const Icon = template.icon
            return (
              <GlassCard key={template.id} className="border-white/10 bg-black/30">
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <Icon className="h-5 w-5 text-white/70" />
                  <span>{template.name}</span>
                </div>
                <p className="mt-4 text-sm text-white/60">{template.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/workflow?template=${template.id}`}
                    className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white/50"
                  >
                    Load & customize
                  </Link>
                  <Link
                    href="/workspace"
                    className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white/50"
                  >
                    Chat companion
                  </Link>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
