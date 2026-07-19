'use client'

import React, { useState, useRef, useCallback, useEffect, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { isRtlLocale, type Locale } from '@/i18n/routing'
import { Play } from 'lucide-react'
import { CarouselItem } from './types'
import { Lightbox } from './Lightbox'

type Props = {
  items: CarouselItem[]
  sectionLabel: string
  sectionDescription: string
}

const SPEED_WHEEL = 0.02
const SPEED_DRAG = -0.1

export function Template1Carousel({ items, sectionLabel, sectionDescription }: Props) {
  const [progress, setProgress] = useState(50)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const locale = useLocale()
  const isRtl = isRtlLocale(locale as Locale)

  const prefersReducedMotion = useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )

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

  const clamped = Math.max(0, Math.min(progress, 100))
  const active = Math.floor(clamped / 100 * (items.length - 1))

  const getZindex = useCallback((array: unknown[], index: number) =>
    array.map((_, i) => (index === i) ? array.length : array.length - Math.abs(index - i)), [])

  const zIndices = getZindex(items, active)

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setProgress(p => p + e.deltaY * SPEED_WHEEL)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDown(true)
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(x)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDown) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    setProgress(p => p + (x - startX) * SPEED_DRAG)
    setStartX(x)
  }, [isDown, startX])

  const handleMouseUp = useCallback(() => {
    setIsDown(false)
  }, [])

  return (
    <div className="space-y-6">
      <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1rem' }}>
        <h2 className="font-display text-3xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {sectionLabel}
        </h2>
        <p className="mt-2 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          {sectionDescription}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{ height: '420px', perspective: '1200px' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {items.map((item, index) => {
          const isEmbed = item.type === 'UPLOADED_VIDEO' || item.type === 'YOUTUBE' || item.type === 'GOOGLE_DRIVE' || item.type === 'FACEBOOK'
          const imgUrl = item.thumbnailUrl || item.url
          const zIndex = zIndices[index]
          const activeOffset = (index - active) / items.length
          const xOffset = activeOffset * 80 * (isRtl ? -1 : 1)
          const rotation = activeOffset * 6 * (isRtl ? -1 : 1)

          return (
            <div
              key={item.id}
              className="absolute rounded-xl overflow-hidden cursor-pointer transition-[transform,opacity]"
              style={{
                width: '280px',
                height: '340px',
                left: '50%',
                top: '50%',
                marginLeft: '-140px',
                marginTop: '-170px',
                zIndex,
                transform: prefersReducedMotion
                  ? 'translate(-50%, -50%)'
                  : `translate(calc(-50% + ${xOffset}px), -50%) rotateY(${rotation}deg)`,
                opacity: Math.abs(activeOffset) > 0.5 ? Math.max(0, 1 - Math.abs(activeOffset)) : 1,
                transition: prefersReducedMotion ? 'none' : 'transform 0.8s cubic-bezier(0, 0.02, 0, 1), opacity 0.8s ease',
              }}
              onClick={() => {
                setProgress((index / items.length) * 100 + 10)
                setLightboxIndex(index)
              }}
            >
              <div className="relative w-full h-full bg-[var(--color-bg-elevated)]">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={item.title || 'Gallery item'}
                    fill
                    className="object-cover"
                    sizes="280px"
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
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
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
