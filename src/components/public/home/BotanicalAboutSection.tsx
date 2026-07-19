'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, fadeInRight } from '@/lib/animations'
import { SectionLabel } from '../shared/SectionLabel'

export function BotanicalAboutSection() {
  const t = useTranslations('home')
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
              <SectionLabel>{t('ourStory')}</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-display font-[400] leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('cultivatingTitle')}<br />
              <span style={{ color: 'var(--color-calendula-500)' }}>{t('cultivatingSpan')}</span>
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              className="space-y-4 font-light leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <p>{t('aboutPara1')}</p>
              <p>{t('aboutPara2')}</p>
            </motion.div>
            <motion.ul variants={fadeInUp} className="space-y-3 pt-2">
              {['highlight1', 'highlight2', 'highlight3', 'highlight4'].map((key) => (
                <li key={key} className="flex items-start gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-calendula-500)' }} />
                  <span>{t(key)}</span>
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeInUp} className="pt-4">
              <Link href="/about" className="btn btn-primary">
                {t('learnMoreAboutUs')}
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
