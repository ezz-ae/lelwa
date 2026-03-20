import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative pt-32 pb-12 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tighter mb-6 block">
              Melting the mundane with intelligence.
            </Link>
            <p className="text-white/60 leading-relaxed">
              Lelwa keeps every listing, offer, and follow-up prepared so you can respond with speed and Dubai-grade polish.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Sitemap</h4>
            <ul className="space-y-4 text-white/60">
              <li>
                <Link href="#work" className="hover:text-white transition-colors">
                  Work feed
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/workspace" className="hover:text-white transition-colors">
                  Workspace
                </Link>
              </li>
              <li>
                <Link href="/workflow" className="hover:text-white transition-colors">
                  Workflow
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Socials</h4>
            <ul className="space-y-4 text-white/60">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Let's talk</h4>
            <p className="text-white/60 mb-4">Need a quick demo or strategic brief?</p>
            <a href="mailto:hello@lelwa.ai" className="text-xl font-medium hover:text-emerald-300 transition-colors">
              hello@lelwa.ai
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Lelwa. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
