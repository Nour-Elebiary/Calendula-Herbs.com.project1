'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'
import { heroStagger, heroChild } from '@/lib/animations'

function HeroLeaf({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, -14, 0], rotate: [0, 6, -3, 0], opacity: [0.08, 0.14, 0.08] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <path
        d="M12 2C8 8 6 12 6 16c0 3.3 2.7 6 6 6s6-2.7 6-6c0-4-2-8-6-14z"
        fill="currentColor"
      />
    </motion.svg>
  )
}

export function HeroSection({ tagline, founded }: { tagline: string; founded: string }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -100])
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={sectionRef} className="hero-home relative overflow-hidden">
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
        <div className="about-hero__fallback" aria-hidden="true" />
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="about-hero__video"
        >
          <source
            src="https://res.cloudinary.com/dcukpuftg/video/upload/v1782298734/calendula-herbs/videos/hero-about.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>
      <div className="about-hero__overlay" />
      <motion.div className="hero-atmospheric__fade-bottom" style={{ opacity: prefersReducedMotion ? 1 : fadeOpacity }} />

      {/* Decorative floating leaves — left */}
      <HeroLeaf
        className="absolute top-[15%] left-[4%] w-10 h-10 text-[var(--color-calendula-400)] z-[3] hidden lg:block"
        delay={0}
      />
      <HeroLeaf
        className="absolute bottom-[25%] left-[6%] w-7 h-7 text-[var(--color-green-300)] z-[3] hidden lg:block"
        delay={1.5}
      />

      {/* Decorative floating leaves — right */}
      <HeroLeaf
        className="absolute top-[20%] right-[4%] w-9 h-9 text-[var(--color-green-200)] z-[3] hidden lg:block"
        delay={0.8}
      />
      <HeroLeaf
        className="absolute bottom-[30%] right-[6%] w-6 h-6 text-[var(--color-calendula-300)] z-[3] hidden lg:block"
        delay={2.2}
      />

      <motion.div
        className="about-hero__content"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={heroChild} className="hero-atmospheric__eyebrow" style={{ justifyContent: 'center' }}>
          Premium Export Quality Since {founded || '2005'}
        </motion.div>

        <motion.h1
          variants={heroChild}
          className="hero-atmospheric__headline"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tagline || 'Rooted in Nature,<br />Exported with Care.') }}
        />

        <motion.p variants={heroChild} className="hero-atmospheric__body">
          A reliable end-to-end supply chain from Egyptian farms to global warehouses
          &mdash; GAP/GHP certified, dual drying methods, and MOSH/MOAH-free packaging
          for premium organic herbs, spices, and seeds since {founded || '2005'}.
        </motion.p>

        <motion.div variants={heroChild} className="hero-atmospheric__actions" style={{ justifyContent: 'center' }}>
          <Link href="/contact" className="btn btn-primary btn-lg whitespace-nowrap">
            Request a Quote
          </Link>
          <Link href="/products" className="btn btn-secondary btn-lg whitespace-nowrap" style={{ color: 'var(--color-text-inverse)', borderColor: 'rgba(255,255,255,0.35)' }}>
            Explore Products
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" style={{ color: 'rgba(250,250,246,0.5)' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
