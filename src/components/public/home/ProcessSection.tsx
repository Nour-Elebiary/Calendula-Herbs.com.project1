'use client'

import { motion } from 'framer-motion'
import { FileText, FlaskConical, ClipboardCheck, Truck } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { SectionLabel } from '../shared/SectionLabel'

const steps = [
  {
    icon: FileText,
    title: 'Inquiry',
    description: 'Submit your product requirements and specifications. Our team reviews and responds within 24 hours with a tailored proposal.',
  },
  {
    icon: FlaskConical,
    title: 'Sample',
    description: 'We prepare and send representative samples for your quality assessment, ensuring the product meets your exact standards.',
  },
  {
    icon: ClipboardCheck,
    title: 'Order',
    description: 'Once samples are approved, we finalize the commercial terms, production schedule, and quality specifications.',
  },
  {
    icon: Truck,
    title: 'Shipment',
    description: 'Your order is processed, packed to export standards, and shipped with full documentation and real-time tracking.',
  },
]

export function ProcessSection() {
  return (
    <section className="py-24 relative" style={{ backgroundColor: 'var(--color-bg-void)' }}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel>How It Works</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-display font-[400] leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            From Inquiry to Shipment
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="font-light max-w-xl mx-auto"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            A streamlined process designed for international buyers. Every step is managed with precision and care.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={fadeInUp}
              className="card-glass p-8 text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'rgba(220,126,24,0.12)', color: 'var(--color-calendula-500)' }}
              >
                <step.icon className="w-7 h-7" />
              </div>
              <div className="relative">
                <span
                  className="absolute -top-2 -right-2 text-6xl font-display font-[400] opacity-10"
                  style={{ color: 'var(--color-calendula-500)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  className="text-xl font-display font-[400] mb-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
