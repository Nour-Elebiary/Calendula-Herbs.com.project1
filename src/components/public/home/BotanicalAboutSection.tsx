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
            <div aria-hidden="true" className="card-line-art w-full h-full px-8">
              <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendula flower - continuous line */}
                <path d="M200 380
                  C160 380 120 350 100 310
                  C80 270 80 220 100 180
                  C120 140 160 100 200 80
                  C240 100 280 140 300 180
                  C320 220 320 270 300 310
                  C280 350 240 380 200 380Z"
                  stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                {/* Inner petals */}
                <path d="M200 340
                  C175 340 150 320 140 290
                  C130 260 135 225 155 205
                  C175 185 200 170 200 170
                  C200 170 225 185 245 205
                  C265 225 270 260 260 290
                  C250 320 225 340 200 340Z"
                  stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
                {/* Center dot */}
                <circle cx="200" cy="230" r="15" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                {/* Stem */}
                <path d="M200 300 L200 380"
                  stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                {/* Leaf on stem */}
                <path d="M200 340 Q220 330 230 345 Q220 360 200 350"
                  stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35" />
                {/* Rosemary sprig - left */}
                <path d="M160 200 Q130 180 100 160
                  M130 185 Q120 170 110 165
                  M145 195 Q135 180 125 175"
                  stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
                {/* Rosemary sprig - right */}
                <path d="M240 200 Q270 180 300 160
                  M270 185 Q280 170 290 165
                  M255 195 Q265 180 275 175"
                  stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
                {/* Decorative dots */}
                <circle cx="100" cy="160" r="2" fill="white" opacity="0.3" />
                <circle cx="300" cy="160" r="2" fill="white" opacity="0.3" />
                {/* Small decorative leaves */}
                <path d="M80 200 Q90 190 100 200 Q90 210 80 200Z"
                  stroke="white" strokeWidth="0.8" fill="none" opacity="0.25" />
                <path d="M300 200 Q310 190 320 200 Q310 210 300 200Z"
                  stroke="white" strokeWidth="0.8" fill="none" opacity="0.25" />
              </svg>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="font-display text-xl text-white/60">Since 2005</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
