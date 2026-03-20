import { Footer } from "@/components/marketing/footer"
import { Hero } from "@/components/marketing/hero"
import { Navbar } from "@/components/marketing/navbar"
import { ReadyWorkflows } from "@/components/marketing/ready-workflows"
import { Services } from "@/components/marketing/services"
import { Work } from "@/components/marketing/work"

export default function MarketingLanding() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <Navbar />
      <Hero />
      <Services />
      <Work />
      <ReadyWorkflows />
      <section id="contact" className="py-32 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6 text-white">Ready to pilot every conversation?</h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Share a listing, lead, or request and we’ll send a ready workflow with the reply, call script, offer, and follow-up before you even start typing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@lelwa.ai"
              className="px-8 py-5 rounded-full bg-white text-black font-semibold text-lg hover:bg-white/90 transition"
            >
              Book a walkthrough
            </a>
            <a
              href="/workspace"
              className="px-8 py-5 rounded-full border border-white/30 text-lg font-semibold hover:border-white/60 transition"
            >
              Enter the workspace
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
