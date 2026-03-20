"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { Calendar, FileText, MessageSquare, PhoneCall } from "lucide-react"

const services = [
  {
    icon: <MessageSquare className="w-8 h-8 text-amber-300" />,
    title: "Lead-ready reply",
    description: "Prepared reply, call plan, and next steps the moment a lead lands.",
  },
  {
    icon: <PhoneCall className="w-8 h-8 text-emerald-300" />,
    title: "Call guidance",
    description: "Call script, objection handling, and closing asks ready for every lead.",
  },
  {
    icon: <FileText className="w-8 h-8 text-sky-300" />,
    title: "Offer + contract",
    description: "Offer summary, contract outline, and send-ready documents on demand.",
  },
  {
    icon: <Calendar className="w-8 h-8 text-lime-300" />,
    title: "Follow-up rhythm",
    description: "Sequenced follow-ups, meeting slots, and reminders that keep deals moving.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            What Lelwa prepares
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col justify-between group">
                <div>
                  <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-white/10 transition-colors">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">{service.title}</h3>
                  <p className="text-white/70 leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-white/40 group-hover:text-white transition-colors">
                  See detail <div className="w-4 h-[1px] bg-current transition-all group-hover:w-8" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
