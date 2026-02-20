"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatedText } from "@/components/animated-text"
import {
  MessageCircle,
  Phone,
  Instagram,
  Facebook,
  Mail,
  Building2,
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  Check,
  Zap,
  FileText,
  Send,
} from "lucide-react"

// ── Animated counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const duration = 1400
        const startTime = performance.now()
        function tick(now: number) {
          const progress = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(eased * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="font-serif text-[52px] md:text-[72px] leading-none font-medium tabular-nums">
      {prefix}{value}{suffix}
    </div>
  )
}

// ── Channels data ─────────────────────────────────────────────────────────────

const CHANNELS = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    desc: "Send replies and offer sheets directly to leads. Never copy-paste again.",
    icon: MessageCircle,
    iconColor: "text-[#25D366]",
    bgColor: "rgba(37,211,102,0.08)",
    borderColor: "rgba(37,211,102,0.20)",
    image: null,
    label: "WhatsApp",
  },
  {
    id: "voice",
    title: "Voice calls",
    desc: "Execute scripted outbound calls — call script prepared before you dial.",
    icon: Phone,
    iconColor: "text-emerald-400",
    bgColor: "rgba(52,211,153,0.08)",
    borderColor: "rgba(52,211,153,0.20)",
    image: null,
    label: "Voice",
  },
  {
    id: "instagram",
    title: "Instagram DMs",
    desc: "Handle every DM inquiry without leaving the console. No app switching.",
    icon: Instagram,
    iconColor: "text-pink-400",
    bgColor: "rgba(236,72,153,0.08)",
    borderColor: "rgba(236,72,153,0.20)",
    image: null,
    label: "Instagram",
  },
  {
    id: "facebook",
    title: "Facebook page",
    desc: "Respond to page inquiries and keep every conversation alive.",
    icon: Facebook,
    iconColor: "text-[#1877F2]",
    bgColor: "rgba(24,119,242,0.08)",
    borderColor: "rgba(24,119,242,0.20)",
    image: null,
    label: "Facebook",
  },
  {
    id: "email",
    title: "Email",
    desc: "Send offer letters, contracts, and follow-ups from a single click.",
    icon: Mail,
    iconColor: "text-violet-400",
    bgColor: "rgba(139,92,246,0.08)",
    borderColor: "rgba(139,92,246,0.20)",
    image: null,
    label: "Email",
  },
  {
    id: "portals",
    title: "Listing portals",
    desc: "Post, refresh, and update listings on Bayut and Property Finder.",
    icon: Building2,
    iconColor: "text-sky-400",
    bgColor: "rgba(14,165,233,0.08)",
    borderColor: "rgba(14,165,233,0.20)",
    image: null,
    label: "Portals",
  },
]

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "What exactly does Lelwa do?",
    a: "Lelwa is an outreach console for Dubai real estate brokers. You submit a lead or property reference, and the console prepares a WhatsApp reply, a call script, and an offer sheet — all at once. You then execute them from the same screen.",
  },
  {
    q: "How does WhatsApp and voice integration work?",
    a: "You connect your WhatsApp Business number and Twilio account once. After that, replies and offer sheets are sent directly from the console — no copy-pasting, no switching apps.",
  },
  {
    q: "Can I use it with Bayut or Property Finder?",
    a: "Yes. The Listing Portals channel connects via API key. Once connected, you can post, refresh, and update listings from the console without logging into each portal separately.",
  },
  {
    q: "Is my credential data safe?",
    a: "All credentials are stored locally on your device. They are never transmitted to third parties, never stored on Lelwa servers, and never shared. You stay in full control.",
  },
  {
    q: "What's included in each package?",
    a: "Core (AED 299/mo) includes WhatsApp and Voice channels for a single operator. Closer (AED 499/mo) adds Instagram, Facebook, Email, and listing portal access for two operators. Team is custom-priced with unlimited operators and dedicated support.",
  },
  {
    q: "How do I get started?",
    a: "Open the console, select an operation, submit your first lead. Connect a channel when the console prompts you. First output is prepared in under 60 seconds.",
  },
]

// ── Pricing data ─────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: "core",
    name: "Core",
    price: "AED 299",
    per: "/ month",
    recommended: false,
    cta: "Activate Core",
    features: [
      "WhatsApp & Voice channels",
      "Lead replies and call scripts",
      "Offer sheets and contracts",
      "Single operator",
      "Session history",
    ],
  },
  {
    id: "closer",
    name: "Closer",
    price: "AED 499",
    per: "/ month",
    recommended: true,
    cta: "Activate Closer",
    features: [
      "Everything in Core",
      "Instagram & Facebook channels",
      "Email outreach",
      "Listing portal submissions",
      "Follow-up sequences",
      "2 operators",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "Custom",
    per: "",
    recommended: false,
    cta: "Contact sales",
    features: [
      "Everything in Closer",
      "Unlimited operators",
      "Dedicated account manager",
      "Custom channel integrations",
      "Priority support",
    ],
  },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LelwaMarketingPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [selectedChannel, setSelectedChannel] = useState(0)
  const [channelFade, setChannelFade] = useState(true)
  const [autoKey, setAutoKey] = useState(0)
  const [dynamicIndex, setDynamicIndex] = useState(0)
  const [wordFade, setWordFade] = useState(true)
  const [dashboardTilt, setDashboardTilt] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  const dynamicWords = ["every lead", "every deal", "every listing", "every offer", "every follow-up"]

  // Word rotation
  useEffect(() => {
    const t = setInterval(() => {
      setWordFade(false)
      setTimeout(() => { setDynamicIndex((p) => (p + 1) % dynamicWords.length); setWordFade(true) }, 300)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  // Scroll / dashboard tilt
  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY)
      if (!dashboardRef.current) return
      const rect = dashboardRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * 0.8, end = vh * 0.2
      if (rect.top >= start) setDashboardTilt(0)
      else if (rect.top <= end) setDashboardTilt(14)
      else setDashboardTilt(((start - rect.top) / (start - end)) * 14)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Load + scroll observer
  useEffect(() => {
    setIsLoaded(true)
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("animate-in") }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )
    document.querySelectorAll(".animate-on-scroll").forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Channel auto-rotation
  useEffect(() => {
    const t = setInterval(() => {
      setChannelFade(false)
      setTimeout(() => { setSelectedChannel((p) => (p + 1) % CHANNELS.length); setChannelFade(true) }, 300)
    }, 5000)
    return () => clearInterval(t)
  }, [autoKey])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setIsMenuOpen(false)
  }

  const ch = CHANNELS[selectedChannel]

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] text-[#f5f5f7] overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="fixed top-5 left-5 right-5 z-40 glass-nav">
        <div className="mx-auto px-5 md:px-6">
          <div className="flex items-center h-14 gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-base font-semibold tracking-tight hover:opacity-70 transition-opacity"
            >
              Lelwa
            </button>

            <nav className="hidden md:flex items-center gap-7 ml-2">
              {[
                ["How it works", "how"],
                ["Channels", "channels"],
                ["Pricing", "pricing"],
                ["FAQ", "faq"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-sm text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <a
                href="/studio"
                className="hidden md:flex items-center gap-1.5 rounded-full bg-[#f5f5f7] text-[#0a0a0b] px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
              >
                Open console <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#0a0a0b]/97 backdrop-blur-md z-50 flex flex-col items-start justify-end pb-20 px-8">
          <div className="flex flex-col gap-7 w-full">
            {[
              ["How it works", "how"],
              ["Channels", "channels"],
              ["Pricing", "pricing"],
              ["FAQ", "faq"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="font-serif text-5xl font-light text-[#f5f5f7] hover:text-[#d4a853] transition-colors text-left"
              >
                {label}
              </button>
            ))}
            <a
              href="/studio"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] text-[#0a0a0b] px-6 py-3 text-base font-medium w-fit"
            >
              Open console <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className={`relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLoaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"}`}
      >
        {/* Background gradient orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(ellipse, #d4a853 0%, transparent 70%)", transform: `translateX(-50%) translateY(${scrollY * 0.12}px)` }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 w-[600px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(ellipse, #f59e0b 0%, transparent 70%)" }}
          />
        </div>

        <div className="max-w-[1120px] w-full mx-auto relative z-10 text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 glass-pill px-4 py-2 rounded-full mb-10 text-xs text-[#86868b] stagger-reveal"
            style={{ animationDelay: "0ms" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
            Built for Dubai real estate brokers
          </div>

          {/* Headline */}
          <h1 className="stagger-reveal" style={{ animationDelay: "80ms" }}>
            <span
              className={`block font-serif text-[56px] leading-[1.05] md:text-[88px] font-light transition-all duration-500 ${wordFade ? "opacity-100 blur-0" : "opacity-0 blur-sm"}`}
            >
              Close{" "}
              <span className="grad-gold">
                <AnimatedText key={dynamicIndex} text={dynamicWords[dynamicIndex]} />
              </span>
            </span>
            <span className="block font-serif text-[56px] leading-[1.05] md:text-[88px] font-light" style={{ animationDelay: "120ms" }}>
              from one console.
            </span>
          </h1>

          <p
            className="stagger-reveal mt-7 text-[#86868b] text-base md:text-lg max-w-[540px] mx-auto leading-relaxed"
            style={{ animationDelay: "200ms" }}
          >
            WhatsApp, voice calls, offers, and listings — prepared in seconds and
            executed from a single screen. No switching apps. No copy-pasting.
          </p>

          <div className="stagger-reveal flex flex-col sm:flex-row items-center justify-center gap-3 mt-10" style={{ animationDelay: "280ms" }}>
            <a
              href="/studio"
              className="flex items-center gap-2 rounded-full bg-[#f5f5f7] text-[#0a0a0b] px-7 py-3.5 text-sm font-semibold hover:bg-white transition-colors"
            >
              Open console <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => scrollTo("pricing")}
              className="flex items-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:border-white/20 transition-colors"
            >
              See pricing
            </button>
          </div>

          {/* 3D dashboard */}
          <div
            className="mt-16 md:mt-24 stagger-reveal"
            style={{ animationDelay: "400ms" }}
            ref={dashboardRef}
          >
            <div style={{ perspective: "1400px" }}>
              <div
                className="relative rounded-[20px] md:rounded-[28px] overflow-hidden border border-white/[0.08]"
                style={{
                  transform: `rotateX(${dashboardTilt}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.06s linear",
                  boxShadow: "0 40px 120px -40px rgba(212,168,83,0.15), 0 0 0 1px rgba(255,255,255,0.04)",
                }}
              >
                {/* Console mockup — CSS-rendered since no screenshot asset */}
                <div className="w-full bg-[#0d0d0e] dashboard-image">
                  <div className="h-8 bg-[#111113] flex items-center gap-1.5 px-4 border-b border-white/[0.05]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    <span className="ml-4 text-[10px] text-[#3a3a3c] font-mono">lelwa — console</span>
                  </div>
                  <div className="flex" style={{ minHeight: "420px" }}>
                    {/* Sidebar */}
                    <div className="w-20 border-r border-white/[0.05] flex flex-col items-center py-5 gap-4 shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-[#1a1a1c] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#d4a853]">L</span>
                      </div>
                      {["◻", "⊡", "✓", "⊞"].map((icon, i) => (
                        <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] ${i === 1 ? "bg-white/[0.07] text-[#f5f5f7]" : "text-[#3a3a3c]"}`}>{icon}</div>
                      ))}
                    </div>
                    {/* Main console area */}
                    <div className="flex-1 p-6 flex flex-col gap-4">
                      {/* User message */}
                      <div className="ml-auto max-w-xs rounded-2xl rounded-tr-sm bg-white/[0.06] px-4 py-3 text-[12px] text-[#f5f5f7]/80">
                        Lead: Ahmed Al-Rashid. Budget 2.8M AED. Looking for 2BR in Dubai Marina. Coming from Instagram.
                      </div>
                      {/* Response blocks */}
                      <div className="space-y-2.5">
                        {[
                          { label: "WhatsApp Reply", color: "rgba(37,211,102,0.15)", border: "rgba(37,211,102,0.25)", text: "Hi Ahmed, thank you for reaching out! We have several 2BR options in Dubai Marina within your budget starting from AED 2.4M..." },
                          { label: "Call Script", color: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "Opening: Introduce yourself, reference the Marina inquiry. Key points: Unit availability, payment plan, view..." },
                          { label: "Offer Sheet", color: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", text: "2BR Dubai Marina · AED 2,650,000 · Floor 22 · Sea view · 60/40 payment plan · Ready Q2 2026" },
                        ].map((block) => (
                          <div key={block.label} className="rounded-xl p-3.5" style={{ background: block.color, border: `1px solid ${block.border}` }}>
                            <div className="text-[9px] uppercase tracking-[0.18em] text-[#86868b] mb-1.5">{block.label}</div>
                            <p className="text-[11px] text-[#f5f5f7]/75 leading-relaxed line-clamp-2">{block.text}</p>
                          </div>
                        ))}
                      </div>
                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap mt-1">
                        {["Send WhatsApp", "Send Email", "Post Listing"].map((label) => (
                          <div key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-[#86868b]">{label}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo marquee ─────────────────────────────────────────────────────── */}
      <section className="relative py-10 border-y border-white/[0.05] bg-[#0a0a0b]">
        <p className="text-center text-[10px] md:text-xs uppercase tracking-[0.22em] text-[#3a3a3c] mb-8">
          Trusted by Dubai real estate teams
        </p>
        <div className="logo-marquee">
          <div className="logo-marquee-content">
            {[
              "DAMAC Properties",
              "Emaar Realty",
              "Bayut Partner",
              "Property Finder",
              "Betterhomes",
              "Allsopp & Allsopp",
              "Knight Frank Dubai",
              "Haus & Haus",
              "DAMAC Properties",
              "Emaar Realty",
              "Bayut Partner",
              "Property Finder",
              "Betterhomes",
              "Allsopp & Allsopp",
              "Knight Frank Dubai",
              "Haus & Haus",
            ].map((name, i) => (
              <div key={i} className="px-10 md:px-14 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-[#2a2a2c] whitespace-nowrap hover:text-[#3a3a3c] transition-colors">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics ──────────────────────────────────────────────────────────── */}
      <section id="metrics" className="relative py-24 md:py-36 px-4 animate-on-scroll">
        <div className="max-w-[1120px] w-full mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#86868b] mb-5 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
              Built for performance
            </div>
            <h2 className="font-serif text-[34px] leading-[1.12] md:text-[52px] font-medium text-balance">
              One console.{" "}
              <span className="grad-gold">Every output.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 max-w-[900px] mx-auto">
            {[
              { label: "Channels connected", target: 6, suffix: "", prefix: "", desc: "WhatsApp to portals" },
              { label: "Starting price", target: 299, suffix: "", prefix: "AED ", desc: "per month" },
              { label: "Outputs per lead", target: 3, suffix: "", prefix: "", desc: "reply, script, offer" },
              { label: "Lead response", target: 90, suffix: "s", prefix: "<", desc: "average time" },
            ].map((m, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-white/[0.06] border-l-0 border-t-0 last:border-r-0"
                style={{ borderTopWidth: i < 2 ? "0" : "0" }}
              >
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#86868b] mb-4 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? "bg-[#d4a853]/60" : "bg-amber-500/40"}`} />
                  {m.label}
                </div>
                <AnimatedCounter target={m.target} suffix={m.suffix} prefix={m.prefix} />
                <div className="text-[11px] text-[#86868b] mt-2">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how" className="relative py-24 md:py-36 px-4 animate-on-scroll bg-[#0a0a0b]">
        <div className="max-w-[1120px] w-full mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#86868b] mb-5 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
              Workflow
            </div>
            <h2 className="font-serif text-[34px] leading-[1.12] md:text-[52px] font-medium text-balance">
              Three steps.{" "}
              <span className="grad-gold">Sixty seconds.</span>
            </h2>
            <p className="mt-5 text-[#86868b] text-sm md:text-base max-w-[500px] mx-auto leading-relaxed">
              No training required. No complex setup. Submit and execute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                icon: Send,
                title: "Submit a lead",
                desc: "Paste a name, budget, and preference. Or forward a WhatsApp message. The console reads it.",
                accent: "#d4a853",
              },
              {
                step: "02",
                icon: Zap,
                title: "Console prepares",
                desc: "A reply, a call script, and an offer sheet are prepared simultaneously. No waiting.",
                accent: "#d4a853",
              },
              {
                step: "03",
                icon: FileText,
                title: "Execute",
                desc: "Send, call, sign — from the same screen. One button per action. No app switching.",
                accent: "#d4a853",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative rounded-3xl p-7 md:p-8 glass-card flex flex-col gap-5 group transition-all duration-300 hover:border-white/[0.12]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: `rgba(212,168,83,0.10)`, border: "1px solid rgba(212,168,83,0.20)" }}
                  >
                    <step.icon className="h-5 w-5 text-[#d4a853]" />
                  </div>
                  <span className="text-[11px] font-mono text-[#2a2a2c] group-hover:text-[#3a3a3c] transition-colors">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-[#f5f5f7] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#86868b] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Channels ─────────────────────────────────────────────────────────── */}
      <section id="channels" className="relative py-24 md:py-36 px-4 animate-on-scroll">
        <div className="max-w-[1120px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">

            {/* Left: channel list */}
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#86868b] mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
                Outreach channels
              </div>
              <h2 className="font-serif text-[34px] leading-[1.12] md:text-[52px] font-medium mb-7 text-balance">
                Every channel.{" "}
                <span className="grad-gold">One screen.</span>
              </h2>
              <p className="text-[#86868b] text-sm md:text-base leading-relaxed mb-10">
                Connect once. Execute from the console. Your credentials never leave your device.
              </p>

              <div className="space-y-3">
                {CHANNELS.map((channel, i) => {
                  const Icon = channel.icon
                  const isActive = selectedChannel === i
                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setChannelFade(false)
                        setTimeout(() => { setSelectedChannel(i); setChannelFade(true); setAutoKey((p) => p + 1) }, 300)
                      }}
                      className={`relative w-full text-left flex gap-4 items-center p-4 rounded-2xl transition-all duration-300 overflow-hidden ${isActive ? "border border-white/[0.12]" : "border border-white/[0.05] hover:border-white/[0.09]"}`}
                      style={{ background: isActive ? channel.bgColor : "transparent" }}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: channel.bgColor, border: `1px solid ${channel.borderColor}` }}
                      >
                        <Icon className={`h-4.5 w-4.5 ${channel.iconColor}`} style={{ width: "18px", height: "18px" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#f5f5f7]">{channel.title}</div>
                        <div className="text-xs text-[#86868b] mt-0.5 leading-relaxed">{channel.desc}</div>
                      </div>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.05]">
                          <div className="h-full progress-bar" style={{ background: `linear-gradient(90deg, ${channel.borderColor}, transparent)` }} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: channel visual */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className={`w-full rounded-3xl p-8 flex flex-col gap-6 transition-all duration-500 ${channelFade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
                style={{
                  background: ch.bgColor,
                  border: `1px solid ${ch.borderColor}`,
                  minHeight: "480px",
                }}
              >
                {/* Channel icon */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: ch.bgColor, border: `1px solid ${ch.borderColor}` }}
                  >
                    <ch.icon className={`h-6 w-6 ${ch.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#86868b]">Channel</div>
                    <div className="text-base font-semibold text-[#f5f5f7]">{ch.title}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[10px] text-[#86868b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </div>
                </div>

                {/* Credential preview */}
                <div className="space-y-2">
                  {selectedChannel === 0 && (
                    <>
                      <CredField label="Twilio Account SID" value="AC•••••••••••••••••••••••••••••••" />
                      <CredField label="Auth Token" value="••••••••••••••••••••••••••" type="password" />
                      <CredField label="WhatsApp sender" value="whatsapp:+971XXXXXXXXX" />
                    </>
                  )}
                  {selectedChannel === 1 && (
                    <>
                      <CredField label="Twilio Account SID" value="AC•••••••••••••••••••••••••••••••" />
                      <CredField label="Auth Token" value="••••••••••••••••••••••••••" type="password" />
                      <CredField label="Caller number" value="+971XXXXXXXXX" />
                    </>
                  )}
                  {selectedChannel === 2 && (
                    <>
                      <CredField label="Page Access Token" value="EAAx••••••••••••••••" type="password" />
                      <CredField label="Instagram Business ID" value="17841400••••••••" />
                    </>
                  )}
                  {selectedChannel === 3 && (
                    <>
                      <CredField label="Page Access Token" value="EAAx••••••••••••••••" type="password" />
                      <CredField label="Facebook Page ID" value="1055••••••••" />
                    </>
                  )}
                  {selectedChannel === 4 && (
                    <>
                      <CredField label="SMTP Host" value="smtp.gmail.com" />
                      <CredField label="Port" value="587" />
                      <CredField label="App Password" value="••••••••••••••••" type="password" />
                    </>
                  )}
                  {selectedChannel === 5 && (
                    <>
                      <CredField label="Portal" value="Bayut" />
                      <CredField label="API Key" value="••••••••••••••••••••••••••" type="password" />
                      <CredField label="Agency Ref" value="AGY-4721" />
                    </>
                  )}
                </div>

                {/* Privacy note */}
                <div className="mt-auto pt-4 border-t border-white/[0.06]">
                  <p className="text-[11px] text-[#86868b]">
                    Stored locally. Never transmitted to third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative py-24 md:py-36 px-4 animate-on-scroll bg-[#0a0a0b]">
        <div className="max-w-[1120px] w-full mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#86868b] mb-5 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
              Packages
            </div>
            <h2 className="font-serif text-[34px] leading-[1.12] md:text-[52px] font-medium text-balance">
              Select a{" "}
              <span className="grad-gold">package.</span>
            </h2>
            <p className="mt-5 text-[#86868b] text-sm md:text-base max-w-[440px] mx-auto">
              All packages activate immediately. No trial periods. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1000px] mx-auto">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-3xl p-7 transition-all duration-300 ${
                  pkg.recommended
                    ? "border border-[#d4a853]/30 bg-[#d4a853]/[0.04]"
                    : "glass-card"
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full border border-[#d4a853]/40 bg-[#d4a853]/15 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[#d4a853] whitespace-nowrap">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#f5f5f7] mb-3">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-[42px] leading-none font-medium">{pkg.price}</span>
                    {pkg.per && <span className="text-sm text-[#86868b]">{pkg.per}</span>}
                  </div>
                </div>

                <ul className="flex-1 space-y-2.5 mb-7">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#86868b]">
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#d4a853]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="/studio"
                  className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition-all duration-200 ${
                    pkg.recommended
                      ? "bg-[#d4a853] text-[#0a0a0b] hover:bg-[#e8c06a]"
                      : "border border-white/10 text-[#f5f5f7] hover:bg-white/[0.06]"
                  }`}
                >
                  {pkg.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative py-24 md:py-36 px-4 animate-on-scroll">
        <div className="max-w-[760px] w-full mx-auto">
          <div className="text-center mb-14 md:mb-18">
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#86868b] mb-5 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
              Frequently asked
            </div>
            <h2 className="font-serif text-[34px] leading-[1.12] md:text-[52px] font-medium">
              Got{" "}
              <span className="grad-gold">questions?</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border border-white/[0.07] rounded-2xl overflow-hidden transition-all duration-200 hover:border-white/[0.12]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4"
                >
                  <span className="text-sm md:text-base font-medium text-[#f5f5f7]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-[#86868b] transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="px-5 md:px-6 pb-5 text-sm md:text-base text-[#86868b] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section id="cta" className="relative py-28 md:py-44 px-4 animate-on-scroll overflow-hidden">
        {/* Gold radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full opacity-[0.09]"
            style={{ background: "radial-gradient(ellipse, #d4a853 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-[760px] w-full mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass-pill px-4 py-2 rounded-full mb-8 text-xs text-[#86868b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a853] animate-pulse" />
            Ready when you are
          </div>

          <h2 className="font-serif text-[42px] leading-[1.1] md:text-[68px] font-medium mb-7 text-balance">
            Close every deal.{" "}
            <span className="grad-gold">Starting now.</span>
          </h2>
          <p className="text-[#86868b] text-base md:text-lg mb-10 leading-relaxed max-w-[500px] mx-auto">
            Open the console, submit your first lead, and have a reply, call script, and offer sheet in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/studio"
              className="flex items-center gap-2 rounded-full bg-[#f5f5f7] text-[#0a0a0b] px-8 py-4 text-sm font-semibold hover:bg-white transition-colors"
            >
              Open console <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => scrollTo("pricing")}
              className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] hover:border-white/20 transition-colors"
            >
              View pricing
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative px-4 border-t border-white/[0.05] py-12">
        <div className="max-w-[1120px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <div className="text-base font-semibold">Lelwa</div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                The outreach console for Dubai real estate brokers. Reply, call, offer — from one screen.
              </p>
              <div className="flex items-center gap-4 mt-1">
                <a href="#" className="text-[#3a3a3c] hover:text-[#86868b] transition-colors text-xs">
                  𝕏
                </a>
                <a href="#" className="text-[#3a3a3c] hover:text-[#86868b] transition-colors text-xs">
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#f5f5f7] font-semibold mb-1">Product</div>
              {["Console", "Channels", "Pricing", "Changelog"].map((l) => (
                <a key={l} href="#" className="text-sm text-[#86868b] hover:text-[#f5f5f7] transition-colors">{l}</a>
              ))}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#f5f5f7] font-semibold mb-1">Company</div>
              {["About", "Contact", "Privacy", "Terms"].map((l) => (
                <a key={l} href="#" className="text-sm text-[#86868b] hover:text-[#f5f5f7] transition-colors">{l}</a>
              ))}
            </div>

            {/* Get started */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#f5f5f7] font-semibold mb-1">Get started</div>
              <p className="text-xs text-[#86868b] mb-2 leading-relaxed">
                Open the console and submit your first lead in under a minute.
              </p>
              <a
                href="/studio"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs text-[#86868b] hover:text-[#f5f5f7] hover:border-white/20 transition-colors w-fit"
              >
                Open console <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#3a3a3c]">
            <div>© 2026 Lelwa. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#86868b] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#86868b] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── CredField helper ─────────────────────────────────────────────────────────

function CredField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-[#86868b] uppercase tracking-[0.12em]">{label}</label>
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-xs text-[#f5f5f7]/70 font-mono">
        {type === "password" ? value.replace(/[^•]/g, "•") : value}
      </div>
    </div>
  )
}
