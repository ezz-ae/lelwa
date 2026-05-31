const rawConsoleBaseUrl =
  process.env.NEXT_PUBLIC_CONSOLE_URL ??
  process.env.LELWA_CONSOLE_URL ??
  ""

const consoleBaseUrl = rawConsoleBaseUrl.replace(/\/+$/, "")

export function getConsoleUrl(path = "/studio") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return consoleBaseUrl ? `${consoleBaseUrl}${normalizedPath}` : normalizedPath
}
