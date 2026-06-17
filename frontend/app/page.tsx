import { Footer } from "@/components/marketing/footer"
import { Hero } from "@/components/marketing/hero"
import { Navbar } from "@/components/marketing/navbar"

export default function MarketingLanding() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  )
}
