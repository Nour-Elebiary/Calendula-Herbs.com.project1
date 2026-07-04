'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

type LightboxItem = {
  id: string
  type: string
  url?: string | null
  thumbnailUrl?: string | null
  title?: string | null
  caption?: string | null
}

export function GalleryLightbox({ items }: { items: LightboxItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const open = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const close = useCallback(() => setIsOpen(false), [])

  const next = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length)
  }, [items.length])

  const prev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close, next, prev])

  const current = items[currentIndex]
  const imgUrl = current?.url || current?.thumbnailUrl
  const isVideo = current?.type === 'UPLOADED_VIDEO' || current?.type === 'YOUTUBE'

  return (
    <>
      {items.map((item, index) => {
        const itemImgUrl = item.url || item.thumbnailUrl
        return (
          <button
            key={item.id}
            onClick={() => open(index)}
            className="card-glass group relative aspect-square overflow-hidden cursor-pointer text-left"
          >
            {itemImgUrl ? (
              <Image
                src={itemImgUrl}
                alt={item.title || 'Gallery image'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isVideo
                  ? <Play className="w-10 h-10" style={{ color: 'var(--color-text-tertiary)' }} />
                  : <Image src="/file.svg" alt="" width={40} height={40} style={{ color: 'var(--color-text-tertiary)' }} />
                }
              </div>
            )}
            {isVideo && (
              <div
                className="absolute inset-0 flex items-center justify-center transition-colors"
                style={{ background: 'rgba(0,0,0,0.20)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center pl-1"
                  style={{
                    background: 'rgba(255,253,248,0.90)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <Play className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                </div>
              </div>
            )}
            {(item.title || item.caption) && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4"
                style={{
                  background: 'linear-gradient(to top, rgba(25,40,25,0.85) 0%, rgba(25,40,25,0.15) 60%, transparent 100%)'
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
          </button>
        )
      })}

      {isOpen && imgUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(6,15,9,0.95)' }}
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 transition-colors"
            style={{ color: 'rgba(250,250,246,0.7)' }}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 z-10 p-3 transition-colors"
                style={{ color: 'rgba(250,250,246,0.7)' }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
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
            <div className="relative w-full h-full max-w-[90vw] max-h-[80vh]">
              <Image
                src={imgUrl}
                alt={current?.title || 'Gallery image'}
                fill
                className="object-contain"
                priority
              />
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
              {currentIndex + 1} / {items.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
