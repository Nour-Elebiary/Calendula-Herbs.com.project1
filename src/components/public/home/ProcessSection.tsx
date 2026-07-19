'use client'

import { motion } from 'framer-motion'
import { FileText, FlaskConical, ClipboardCheck, Truck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { SectionLabel } from '../shared/SectionLabel'

export function ProcessSection() {
  const t = useTranslations('home')
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-void)' }}>


      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel>{t('howItWorks')}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-display font-[400] leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('processTitle')}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="font-light max-w-xl mx-auto"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {t('processSubtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {[
            { icon: FileText, titleKey: 'step1Title', descKey: 'step1Desc' },
            { icon: FlaskConical, titleKey: 'step2Title', descKey: 'step2Desc' },
            { icon: ClipboardCheck, titleKey: 'step3Title', descKey: 'step3Desc' },
            { icon: Truck, titleKey: 'step4Title', descKey: 'step4Desc' },
          ].map((step, i) => (
            <motion.div
              key={step.titleKey}
              variants={fadeInUp}
              className="card-glass p-8 text-center relative"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'var(--color-bg-active)', color: 'var(--color-calendula-500)' }}
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
                  {t(step.titleKey)}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {t(step.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
