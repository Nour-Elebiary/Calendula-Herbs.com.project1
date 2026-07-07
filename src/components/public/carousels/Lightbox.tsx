'use client'

import React from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CarouselItem, getYouTubeEmbedUrl, getGoogleDriveEmbedUrl } from './types'

type LightboxProps = {
  items: CarouselItem[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function Lightbox({ items, index, onClose, onPrev, onNext }: LightboxProps) {
  const current = items[index]
  if (!current) return null

  const imgUrl = current.url || current.thumbnailUrl
  const isVideo = current.type === 'UPLOADED_VIDEO'
  const isYouTube = current.type === 'YOUTUBE'
  const isGoogleDrive = current.type === 'GOOGLE_DRIVE'
  const isFacebook = current.type === 'FACEBOOK'
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(current) : null
  const googleDriveEmbedUrl = isGoogleDrive ? getGoogleDriveEmbedUrl(current) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6,15,9,0.95)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 transition-colors"
        style={{ color: 'rgba(250,250,246,0.7)' }}
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            className="absolute left-4 z-10 p-3 transition-colors"
            style={{ color: 'rgba(250,250,246,0.7)' }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
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
          ) : isFacebook && current.externalUrl ? (
            <iframe
              src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(current.externalUrl)}&show_text=false`}
              title={current?.title || 'Facebook video'}
              className="w-full h-full rounded-lg"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : isVideo && current.url ? (
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
          {index + 1} / {items.length}
        </p>
      </div>
    </div>
  )
}
