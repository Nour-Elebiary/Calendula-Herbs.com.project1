'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { fadeInUp } from '@/lib/animations'

const stats = [
  { valueKey: 'stat1Value', unitKey: 'stat1Unit', labelKey: 'stat1Label' },
  { valueKey: 'stat2Value', unitKey: 'stat2Unit', labelKey: 'stat2Label' },
  { valueKey: 'stat3Value', unitKey: 'stat3Unit', labelKey: 'stat3Label' },
  { valueKey: 'stat4Value', unitKey: 'stat4Unit', labelKey: 'stat4Label', href: '/galleries' as const },
]

export function StatsBar() {
  const t = useTranslations('home')
  return (
    <section className="py-16" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="stat-row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.labelKey} variants={fadeInUp} className="stat-item">
              {stat.href ? (
                <Link href={stat.href} className="no-underline">
                  <div className="stat-item__number">{t(stat.valueKey)}</div>
                  <span className="stat-item__unit">{t(stat.unitKey)}</span>
                  <span className="stat-item__label">{t(stat.labelKey)}</span>
                </Link>
              ) : (
                <>
                  <div className="stat-item__number">{t(stat.valueKey)}</div>
                  <span className="stat-item__unit">{t(stat.unitKey)}</span>
                  <span className="stat-item__label">{t(stat.labelKey)}</span>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
