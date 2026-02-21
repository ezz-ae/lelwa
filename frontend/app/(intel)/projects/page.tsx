"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { addProject, listProjects, removeProject, type Project } from "@/lib/project-store"

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState("")

  useEffect(() => {
    setProjects(listProjects())
  }, [])

  const hasProjects = projects.length > 0
  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [projects])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const created = addProject(trimmed)
    setProjects((prev) => [created, ...prev])
    setName("")
  }

  function handleOpen(project: Project) {
    window.localStorage.setItem("lelwa_active_project", project.id)
    router.push(`/studio?project=${project.id}`)
  }

  function handleRemove(id: string) {
    removeProject(id)
    setProjects((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Projects</p>
          <h1 className="mt-1 text-lg font-semibold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep listings, offers, and follow-ups together.</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="h-10 flex-1 rounded-full border border-white/10 bg-black/20 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <Button type="submit" variant="outline" className="rounded-full border-white/10 bg-white/5 text-foreground hover:bg-white/10">
            Create project
          </Button>
        </form>

        {!hasProjects ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
            No projects yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((project) => (
              <div key={project.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{project.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Updated {formatDate(project.updatedAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-foreground hover:bg-white/10" onClick={() => handleOpen(project)}>
                    Open
                  </Button>
                  <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" onClick={() => handleRemove(project.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
