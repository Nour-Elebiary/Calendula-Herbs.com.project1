'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'

const stats = [
  { value: '45', unit: 'Years', label: 'Farming' },
  { value: '25', unit: 'Years', label: 'Manufacturing' },
  { value: '11', unit: 'Years', label: 'Exporting' },
  { value: '4+', unit: 'Times', label: 'At BIOFACH' },
]

export function StatsBar() {
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
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeInUp} className="stat-item">
              <div className="stat-item__number">{stat.value}</div>
              <span className="stat-item__unit">{stat.unit}</span>
              <span className="stat-item__label">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
