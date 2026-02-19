import type React from "react"
import type { Metadata } from "next"
import { Fraunces, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" })
const _display = Fraunces({ subsets: ["latin"], variable: "--font-display" })
const _mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Lelwa | Real Estate Intelligence",
  description: "AI-powered market research and property intelligence for Dubai/UAE.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_body.variable} ${_display.variable} ${_mono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
