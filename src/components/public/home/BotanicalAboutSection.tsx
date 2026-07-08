'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { fadeInUp, fadeInRight } from '@/lib/animations'
import { SectionLabel } from '../shared/SectionLabel'

const highlights = [
  'End-to-end traceability from farm to shipment',
  'GAP & GHP certified farming practices',
  'MOSH/MOAH-free packaging for product integrity',
  'Dual drying options: sun & machine drying',
]

export function BotanicalAboutSection() {
  return (
    <section className="py-24 overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          >
            <motion.div variants={fadeInUp}>
              <SectionLabel>Our Story</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-display font-[400] leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Cultivating Excellence.<br />
              <span style={{ color: 'var(--color-calendula-500)' }}>Delivering Trust.</span>
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              className="space-y-4 font-light leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <p>
                Based in the fertile Fayoum region of Egypt, Calendula Herbs manages the full supply
                chain from cultivation to delivery — operating our own and contracted farms under
                Good Agricultural Practices (GAP) and Good Handling Practices (GHP).
              </p>
              <p>
                With <strong>45 years of farming expertise</strong>, <strong>25 years of manufacturing excellence</strong>,
                and <strong>11 years of global export experience</strong>, we bring unparalleled heritage
                to every shipment. Our reformed processing facilities clean, process, and blend goods
                per global food regulations, with in-house laboratory testing at every stage.
              </p>
            </motion.div>
            <motion.ul variants={fadeInUp} className="space-y-3 pt-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-calendula-500)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeInUp} className="pt-4">
              <Link href="/about" className="btn btn-primary">
                Learn More About Us
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative h-[500px] hidden lg:block"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg bg-neutral-100">
              <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
              <iframe
                src="https://www.youtube.com/embed/GlmljM2BUwQ"
                title="Calendula Herbs — Cultivating Excellence"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full rounded-2xl"
                style={{ border: 0 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
