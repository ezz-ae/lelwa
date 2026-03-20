"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { FileText, PhoneCall, Send } from "lucide-react"

const flows = [
  {
    title: "Lead capture → reply",
    category: "Lead response",
    color: "from-amber-500/20 to-emerald-500/20",
    highlights: ["Reply text ready", "Call plan drafted", "Next steps queued"],
  },
  {
    title: "Listing launch pack",
    category: "Listing prep",
    color: "from-sky-500/20 to-lime-500/20",
    highlights: ["Listing description", "Media checklist", "Launch schedule"],
  },
  {
    title: "Offer + close",
    category: "Deal closing",
    color: "from-rose-500/20 to-orange-500/20",
    highlights: ["Offer summary", "Contract outline", "Send-ready PDF"],
  },
]

export function Work() {
  return (
    <section id="work" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Prepared in action
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 max-w-md"
            >
              Replies, calls, offers, and follow-ups are ready before you open the thread.
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            View all flows
          </motion.button>
        </div>

        <div className="space-y-20">
          {flows.map((flow, index) => (
            <motion.div
              key={flow.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <GlassCard className="p-0 overflow-hidden group">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-12 flex flex-col justify-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${flow.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    <div className="relative z-10">
                      <span className="text-sm font-medium text-white/50 mb-4 block uppercase tracking-wider">
                        {flow.category}
                      </span>
                      <h3 className="text-4xl md:text-5xl font-bold mb-6 group-hover:translate-x-2 transition-transform duration-500">
                        {flow.title}
                      </h3>
                      <p className="text-white/70 mb-8 max-w-md">
                        Every step is prepared as a concrete deliverable you can send or review.
                      </p>
                      <div className="flex items-center gap-3 text-sm font-medium text-white/40 group-hover:text-white transition-colors">
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">Prepared</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">Ready to send</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-[360px] md:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
                    <div className="relative h-full p-10 flex flex-col justify-center gap-6">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <FileText className="h-4 w-4 text-amber-300" />
                          <span>Prepared outputs</span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-white/70">
                          {flow.highlights.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/40">
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <PhoneCall className="h-3.5 w-3.5" />
                          Call
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
