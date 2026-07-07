'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'

type CarouselItem = {
  id: string
  type: string
  url?: string | null
  thumbnailUrl?: string | null
  title?: string | null
  caption?: string | null
  externalId?: string | null
  externalUrl?: string | null
}

function getYouTubeEmbedUrl(item: CarouselItem): string | null {
  const id = item.externalId
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  const url = item.url || item.thumbnailUrl
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`
  }
  return null
}

function getGoogleDriveEmbedUrl(item: CarouselItem): string | null {
  const url = item.externalUrl || item.url
  if (!url) return null
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  if (item.externalId) return `https://drive.google.com/file/d/${item.externalId}/preview`
  return null
}

export function GalleryCarousel({
  items,
  sectionLabel,
  sectionDescription,
}: {
  items: CarouselItem[]
  sectionLabel: string
  sectionDescription: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: prefersReducedMotion.current ? 'instant' : 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => { el.removeEventListener('scroll', checkScroll) }
  }, [checkScroll])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxIndex(null) }
      if (e.key === 'ArrowRight') { setLightboxIndex(prev => prev !== null ? (prev + 1) % items.length : 0) }
      if (e.key === 'ArrowLeft') { setLightboxIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : 0) }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, items.length])

  const current = lightboxIndex !== null ? items[lightboxIndex] : null
  const imgUrl = current?.url || current?.thumbnailUrl
  const isVideo = current?.type === 'UPLOADED_VIDEO'
  const isYouTube = current?.type === 'YOUTUBE'
  const isGoogleDrive = current?.type === 'GOOGLE_DRIVE'
  const isFacebook = current?.type === 'FACEBOOK'
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(current) : null
  const googleDriveEmbedUrl = isGoogleDrive ? getGoogleDriveEmbedUrl(current) : null

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

      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scrollBy('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-lg"
            style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.95))' }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowLeft') scrollBy('left')
            if (e.key === 'ArrowRight') scrollBy('right')
          }}
          tabIndex={0}
          role="region"
          aria-label={`${sectionLabel} gallery`}
        >
          {items.map((item, index) => {
            const itemImgUrl = item.url || item.thumbnailUrl
            const itemIsEmbed = item.type === 'UPLOADED_VIDEO' || item.type === 'YOUTUBE' || item.type === 'GOOGLE_DRIVE' || item.type === 'FACEBOOK'
            return (
              <Card3DItem key={item.id} prefersReducedMotionRef={prefersReducedMotion}>
                <button
                  onClick={() => setLightboxIndex(index)}
                  className="block w-full h-full text-left"
                  aria-label={item.title || `Gallery item ${index + 1}`}
                >
                  <div className="relative w-[260px] sm:w-[300px] md:w-[340px] aspect-[4/3] rounded-xl overflow-hidden bg-[var(--color-bg-elevated)]">
                    {itemImgUrl ? (
                      <Image
                        src={itemImgUrl}
                        alt={item.title || 'Gallery image'}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                        sizes="(max-width: 640px) 260px, (max-width: 768px) 300px, 340px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-10 h-10" style={{ color: 'var(--color-text-tertiary)' }} />
                      </div>
                    )}
                    {itemIsEmbed && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.20)' }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center pl-1"
                          style={{
                            background: 'rgba(255,253,248,0.90)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <Play className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                        </div>
                      </div>
                    )}
                    {(item.title || item.caption) && (
                      <div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4"
                        style={{
                          background: 'linear-gradient(to top, rgba(25,40,25,0.85) 0%, rgba(25,40,25,0.15) 60%, transparent 100%)',
                        }}
                      >
                        {item.title && (
                          <h4 className="font-medium text-sm" style={{ color: 'var(--color-text-inverse)' }}>
                            {item.title}
                          </h4>
                        )}
                        {item.caption && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(250,250,246,0.75)' }}>
                            {item.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </Card3DItem>
            )
          })}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollBy('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity shadow-lg"
            style={{ background: 'var(--color-bg-card, rgba(255,255,255,0.95))' }}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
          </button>
        )}
      </div>

      {lightboxIndex !== null && (imgUrl || isYouTube || isGoogleDrive || isFacebook || isVideo) && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(6,15,9,0.95)' }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 transition-colors"
            style={{ color: 'rgba(250,250,246,0.7)' }}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : 0) }}
                className="absolute left-4 z-10 p-3 transition-colors"
                style={{ color: 'rgba(250,250,246,0.7)' }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev !== null ? (prev + 1) % items.length : 0) }}
                className="absolute right-4 z-10 p-3 transition-colors"
                style={{ color: 'rgba(250,250,246,0.7)' }}
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div
            className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-[90vw] max-h-[80vh] flex items-center justify-center">
              {isYouTube && youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={current?.title || 'YouTube video'}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isGoogleDrive && googleDriveEmbedUrl ? (
                <iframe
                  src={googleDriveEmbedUrl}
                  title={current?.title || 'Google Drive file'}
                  className="w-full h-full rounded-lg"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : isFacebook && current?.externalUrl ? (
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(current.externalUrl)}&show_text=false`}
                  title={current?.title || 'Facebook video'}
                  className="w-full h-full rounded-lg"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : isVideo && current?.url ? (
                <video
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg"
                  style={{ objectFit: 'contain' }}
                >
                  <source src={current.url} type="video/mp4" />
                </video>
              ) : imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={current?.title || 'Gallery image'}
                  fill
                  className="object-contain"
                  priority
                />
              ) : null}
            </div>
            {(current?.title || current?.caption) && (
              <div className="text-center mt-4 max-w-2xl">
                {current?.title && (
                  <p className="font-medium" style={{ color: 'var(--color-text-inverse)' }}>
                    {current.title}
                  </p>
                )}
                {current?.caption && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(250,250,246,0.6)' }}>
                    {current.caption}
                  </p>
                )}
              </div>
            )}
            <p className="text-xs mt-3" style={{ color: 'rgba(250,250,246,0.4)' }}>
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {items.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Card3DItem({
  children,
  prefersReducedMotionRef,
}: {
  children: React.ReactNode
  prefersReducedMotionRef: React.RefObject<boolean | null>
}) {
  const [style, setStyle] = useState<React.CSSProperties>({
    scrollSnapAlign: 'start',
    flexShrink: 0,
    transformStyle: 'preserve-3d',
    transition: 'transform 0.2s ease-out',
    willChange: 'transform',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotionRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * -10
    const tiltY = (x - 0.5) * 10

    setStyle(prev => ({
      ...prev,
      transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03,1.03,1.03)`,
    }))
  }, [prefersReducedMotionRef])

  const handleMouseLeave = useCallback(() => {
    setStyle(prev => ({
      ...prev,
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    }))
  }, [])

  return (
    <div
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
