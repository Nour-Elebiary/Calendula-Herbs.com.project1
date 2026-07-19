'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { isRtlLocale, type Locale } from '@/i18n/routing'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CarouselItem } from './types'
import { Lightbox } from './Lightbox'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  items: CarouselItem[]
  sectionLabel: string
  sectionDescription: string
}

export function Template3Carousel({ items, sectionLabel, sectionDescription }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const locale = useLocale()
  const isRtl = isRtlLocale(locale as Locale)

  useEffect(() => {
    if (!trackRef.current || items.length === 0) return
    let killed = false

    const cardWidth = 300
    const gap = 20
    const totalWidth = (cardWidth + gap) * items.length

    gsap.set(trackRef.current, { x: 0 })

    const perItemDuration = 3
    const duration = items.length * perItemDuration

    const tl = gsap.timeline({ repeat: -1, paused: false })
      .to(trackRef.current, {
        x: isRtl ? totalWidth : -totalWidth,
        duration,
        ease: 'none',
      })
      .set(trackRef.current, { x: 0 })
      .to(trackRef.current, {
        x: isRtl ? totalWidth : -totalWidth,
        duration,
        ease: 'none',
      })
    if (!killed) timelineRef.current = tl

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => timelineRef.current?.play(),
      onLeave: () => timelineRef.current?.pause(),
      onEnterBack: () => timelineRef.current?.play(),
      onLeaveBack: () => timelineRef.current?.pause(),
    })

    return () => {
      killed = true
      tl.kill()
      st.kill()
      timelineRef.current = null
    }
  }, [items.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : 0)
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % items.length : 0)
    }
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, items.length])

  const doubled = [...items, ...items]
  const cardWidth = 300
  const gap = 20

  const scrubTo = (direction: 'prev' | 'next') => {
    if (!timelineRef.current) return
    const currentTime = timelineRef.current.time()
    const totalDuration = timelineRef.current.duration() / 2
    const scrubAmount = totalDuration / items.length
    const targetTime = direction === 'next'
      ? Math.min(currentTime + scrubAmount, totalDuration * 2)
      : Math.max(currentTime - scrubAmount, 0)
    gsap.to(timelineRef.current, {
      time: targetTime,
      duration: 0.8,
      ease: 'power2.out',
    })
  }

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <h2 className="font-display text-3xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {sectionLabel}
          </h2>
          <p className="mt-2 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {sectionDescription}
          </p>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full group" style={{ height: '360px' }}>
        <div
          ref={trackRef}
          dir={isRtl ? "rtl" : "ltr"}
          className="flex gap-5 absolute"
          style={{ willChange: 'transform' }}
        >
          {doubled.map((item, index) => {
            const isEmbed = item.type === 'UPLOADED_VIDEO' || item.type === 'YOUTUBE' || item.type === 'GOOGLE_DRIVE' || item.type === 'FACEBOOK'
            const imgUrl = item.thumbnailUrl || item.url
            const realIndex = index % items.length

            return (
              <div key={`${item.id}-${index}`} className="shrink-0 group/card cursor-pointer"
                style={{ width: `${cardWidth}px` }}
                onClick={() => setLightboxIndex(realIndex)}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--color-bg-elevated)] transition-transform duration-500 hover:scale-105 hover:-translate-y-2">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={item.title || 'Gallery item'}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-10 h-10" style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                  )}
                  {isEmbed && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.20)' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center pl-1"
                        style={{ background: 'rgba(255,253,248,0.90)', backdropFilter: 'blur(8px)' }}>
                        <Play className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-30"
                    style={{
                      background: 'linear-gradient(to top, rgba(255,255,255,0.3) 0%, transparent 100%)',
                      clipPath: 'inset(50% 0 0 0)',
                      transform: 'rotateX(180deg)',
                      filter: 'blur(4px)',
                    }}
                  />
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover/card:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                      <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => scrubTo('prev')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.95))' }}
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          onClick={() => scrubTo('next')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.95))' }}
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : 0)}
          onNext={() => setLightboxIndex(prev => prev !== null ? (prev + 1) % items.length : 0)}
        />
      )}
    </div>
  )
}
