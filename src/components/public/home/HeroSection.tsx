'use client'

import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'
import { heroStagger, heroChild } from '@/lib/animations'

const VIDEO_URL = 'https://res.cloudinary.com/dcukpuftg/video/upload/v1782298734/calendula-herbs/videos/hero-about.mp4'

export function HeroSection({ tagline, founded }: { tagline: string; founded: string }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -100])
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // When reduced motion is enabled, pause and show the poster/first frame
    if (prefersReducedMotion === true) {
      video.pause()
      return
    }
    if (video.readyState >= 2) {
      video.play().catch(() => {})
    } else {
      const onReady = () => video.play().catch(() => {})
      video.addEventListener('canplay', onReady, { once: true })
      return () => video.removeEventListener('canplay', onReady)
    }
  }, [prefersReducedMotion])

  return (
    <section ref={sectionRef} className="hero-home relative overflow-hidden">
      {/* src directly on <video> — more reliable autoplay than <source> child in Chromium */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="about-hero__video"
        poster="https://res.cloudinary.com/dcukpuftg/video/upload/so_0,f_jpg/v1782298734/calendula-herbs/videos/hero-about.jpg"
        onError={(e) => console.error('[HeroSection] Video failed to load:', VIDEO_URL, e)}
        onCanPlay={() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
          }
        }}
      />

      <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ y: backgroundY }} aria-hidden="true" />
      <div className="about-hero__overlay" />
      <motion.div className="hero-atmospheric__fade-bottom" style={{ opacity: prefersReducedMotion ? 1 : fadeOpacity }} />

      <motion.div
        className="about-hero__content"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={heroChild} className="about-hero__glass-card">
          <motion.div variants={heroChild} className="hero-atmospheric__eyebrow" style={{ justifyContent: 'center' }}>
            Premium Export Quality Since {founded || '2005'}
          </motion.div>

          <motion.h1
            variants={heroChild}
            className="hero-atmospheric__headline"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tagline || 'Rooted in Nature,<br />Exported with Care.') }}
          />

          <motion.p variants={heroChild} className="hero-atmospheric__body" style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
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
