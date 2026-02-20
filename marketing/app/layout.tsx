import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lelwa — Close every deal from your console",
  description:
    "WhatsApp, voice calls, offers, and listings — prepared in seconds and executed from one console. Built for Dubai real estate brokers.",
  icons: {
    icon: "/icon.svg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0b",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[#0a0a0b]">
      <body className="font-sans antialiased bg-[#0a0a0b]">{children}</body>
    </html>
  )
}
