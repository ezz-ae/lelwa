import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const consoleBaseUrl = (
  process.env.LELWA_CONSOLE_URL ??
  process.env.NEXT_PUBLIC_CONSOLE_URL ??
  ""
).replace(/\/+$/, "")

const consoleRoutes = [
  "/studio",
  "/workspace",
  "/login",
  "/activate",
  "/sessions",
  "/projects",
  "/connect",
  "/briefing",
  "/canvas",
  "/chat",
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
  },
  async redirects() {
    if (!consoleBaseUrl) return []

    return consoleRoutes.flatMap((route) => [
      {
        source: route,
        destination: `${consoleBaseUrl}${route}`,
        permanent: false,
      },
      {
        source: `${route}/:path*`,
        destination: `${consoleBaseUrl}${route}/:path*`,
        permanent: false,
      },
    ])
  },
}

export default nextConfig
