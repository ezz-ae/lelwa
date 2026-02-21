export type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

const PROJECTS_KEY = "lelwa_projects"

function readProjects(): Project[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(PROJECTS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Project[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeProjects(list: Project[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(list))
}

export function listProjects(): Project[] {
  return readProjects()
}

export function addProject(name: string): Project {
  const now = new Date().toISOString()
  const project: Project = {
    id: `proj_${crypto.randomUUID()}`,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  }
  const existing = readProjects()
  writeProjects([project, ...existing].slice(0, 50))
  return project
}

export function removeProject(id: string) {
  const existing = readProjects()
  writeProjects(existing.filter((item) => item.id !== id))
}

export function getProjectName(id?: string | null) {
  if (!id) return null
  const existing = readProjects()
  return existing.find((item) => item.id === id)?.name ?? null
}
