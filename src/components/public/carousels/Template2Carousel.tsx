'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Play, ChevronUp, ChevronDown } from 'lucide-react'
import { CarouselItem } from './types'
import { Lightbox } from './Lightbox'

type Props = {
  items: CarouselItem[]
  sectionLabel: string
  sectionDescription: string
}

export function Template2Carousel({ items, sectionLabel, sectionDescription }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const goTo = (newIndex: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((newIndex + items.length) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') setLightboxIndex(null)
        if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : 0)
        if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % items.length : 0)
        return
      }
      if (e.key === 'ArrowUp') goTo(currentIndex - 1)
      if (e.key === 'ArrowDown') goTo(currentIndex + 1)
    }
    if (lightboxIndex !== null) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, currentIndex, isAnimating, items.length])

  const getCardClass = (index: number) => {
    const offset = (index - currentIndex + items.length) % items.length
    if (offset === 0) return 'z-30 scale-100 opacity-100'
    if (offset === 1) return 'z-20 scale-90 opacity-70 translate-y-24'
    if (offset === 2) return 'z-10 scale-80 opacity-40 translate-y-44'
    if (offset === items.length - 1) return 'z-20 scale-90 opacity-70 -translate-y-24'
    if (offset === items.length - 2) return 'z-10 scale-80 opacity-40 -translate-y-44'
    return 'z-0 scale-75 opacity-0 pointer-events-none'
  }

  const current = items[currentIndex]

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Vertical carousel */}
        <div className="relative w-full max-w-md" style={{ height: '420px', perspective: '800px' }}>
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {items.map((item, index) => {
              const isVideoType = item.type === 'UPLOADED_VIDEO' || item.type === 'YOUTUBE' || item.type === 'GOOGLE_DRIVE' || item.type === 'FACEBOOK'
              const imgUrl = item.thumbnailUrl || item.url
              const showPlayOverlay = isVideoType && index === currentIndex
              return (
                <div
                  key={item.id}
                  className={`absolute w-full max-w-sm rounded-xl overflow-hidden cursor-pointer transition-all duration-[600ms] ${getCardClass(index)}`}
                  style={{ filter: index === currentIndex ? 'grayscale(0)' : 'grayscale(0.6)' }}
                  onClick={() => {
                    if (index !== currentIndex) { goTo(index); return }
                    setLightboxIndex(index)
                  }}
                >
                  <div className="relative aspect-[4/3] bg-[var(--color-bg-elevated)]">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={item.title || 'Gallery item'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 400px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-10 h-10" style={{ color: 'var(--color-text-tertiary)' }} />
                      </div>
                    )}
                    {showPlayOverlay && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.20)' }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center pl-1"
                          style={{ background: 'rgba(255,253,248,0.90)', backdropFilter: 'blur(8px)' }}>
                          <Play className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Up/Down arrows on carousel */}
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.95))' }}
            aria-label="Previous item"
          >
            <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.95))' }}
            aria-label="Next item"
          >
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>

        {/* Info panel */}
        <div className="flex flex-col items-center lg:items-start gap-4 lg:min-w-[240px]">
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-display font-medium transition-opacity duration-300" style={{ color: 'var(--color-text-primary)' }}>
              {current?.title || sectionLabel}
            </h3>
            {current?.caption && (
              <p className="text-sm mt-1 transition-opacity duration-300" style={{ color: 'var(--color-text-secondary)' }}>
                {current.caption}
              </p>
            )}
            <p className="text-xs mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
              {currentIndex + 1} / {items.length}
            </p>
          </div>

          {/* Dot indicators — capped at ~9 visible */}
          <div className="flex items-center gap-1.5 max-w-[240px] flex-wrap justify-center">
            {(() => {
              const total = items.length
              if (total <= 9) {
                return items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300"
                    style={{
                      background: i === currentIndex ? 'var(--color-calendula-500, #DC7E18)' : 'var(--color-border-default, #d4d4d4)',
                      transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
                    }}
                    aria-label={`Go to item ${i + 1}`}
                  />
                ))
              }
              const dots = []
              const showEllipsis = (show: boolean) => {
                if (show) dots.push(<span key={`e${dots.length}`} className="text-xs shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>...</span>)
              }
              dots.push(
                <button key={0} onClick={() => goTo(0)} className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                  style={{ background: 0 === currentIndex ? 'var(--color-calendula-500, #DC7E18)' : 'var(--color-border-default, #d4d4d4)', transform: 0 === currentIndex ? 'scale(1.3)' : 'scale(1)' }}
                  aria-label="Go to item 1" />
              )
              if (currentIndex > 3) showEllipsis(true)
              for (let i = Math.max(1, currentIndex - 2); i <= Math.min(total - 2, currentIndex + 2); i++) {
                if (i <= 0 || i >= total - 1) continue
                dots.push(
                  <button key={i} onClick={() => goTo(i)} className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300"
                    style={{ background: i === currentIndex ? 'var(--color-calendula-500, #DC7E18)' : 'var(--color-border-default, #d4d4d4)', transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)' }}
                    aria-label={`Go to item ${i + 1}`} />
                )
              }
              if (currentIndex < total - 5) showEllipsis(true)
              dots.push(
                <button key={total - 1} onClick={() => goTo(total - 1)} className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                  style={{ background: total - 1 === currentIndex ? 'var(--color-calendula-500, #DC7E18)' : 'var(--color-border-default, #d4d4d4)', transform: total - 1 === currentIndex ? 'scale(1.3)' : 'scale(1)' }}
                  aria-label={`Go to item ${total}`} />
              )
              return dots
            })()}
          </div>
        </div>
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
