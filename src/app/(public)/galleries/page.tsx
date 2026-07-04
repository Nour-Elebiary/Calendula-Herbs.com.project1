import React from 'react'
import { db } from '@/lib/db'
import { ImageIcon } from 'lucide-react'
import { GalleryLightbox } from '@/components/public/GalleryLightbox'
import { GallerySection } from '@prisma/client'

export const metadata = {
  title: 'Galleries | Calendula Herbs',
  description: 'Explore our farms, processing facilities, and products through our media galleries.',
}

const SECTION_ORDER: GallerySection[] = [
  'EVENTS',
  'INTERVIEWS_TV',
  'FACTORY',
  'FARMS',
  'SHIPMENTS',
]

const SECTION_META: Record<GallerySection, { label: string; description: string }> = {
  EVENTS: {
    label: 'Events',
    description: 'Moments from our industry events, exhibitions, and gatherings.',
  },
  INTERVIEWS_TV: {
    label: 'Interviews and TV Shows',
    description: 'Media appearances, interviews, and television features.',
  },
  FACTORY: {
    label: 'Factory Pics',
    description: 'A look inside our state-of-the-art processing facilities.',
  },
  FARMS: {
    label: 'Farms Pics',
    description: 'Scenes from our partner farms and cultivation fields.',
  },
  SHIPMENTS: {
    label: 'Shipments Pics',
    description: 'Our products being prepared and shipped worldwide.',
  },
}

export default async function GalleriesPage() {
  const items = await db.galleryItem.findMany({
    where: {
      isActive: true,
      section: { not: null },
      gallery: { isActive: true },
    },
    include: { mediaFile: true, gallery: true },
    orderBy: [{ section: 'asc' }, { order: 'asc' }],
  })

  const grouped = SECTION_ORDER
    .map(section => ({
      section,
      ...SECTION_META[section],
      items: items.filter(item => item.section === section),
    }))
    .filter(group => group.items.length > 0)

  const hasContent = grouped.length > 0

  return (
    <div className="page-root">
      <div className="page-content">
        <section className="bg-[var(--color-bg-elevated)] pt-32 pb-20 text-center px-6" style={{ fontFamily: 'var(--font-body)' }}>
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Media Galleries
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            A visual journey through our farms, state-of-the-art processing facilities, and premium products.
          </p>
        </section>

        <div className="section space-y-24">
          {!hasContent ? (
            <div className="card-glass py-24 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <h3 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                No Galleries Available
              </h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Check back later for photos and videos.</p>
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.section} className="space-y-8">
                <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <h2 className="font-display text-3xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {group.label}
                  </h2>
                  <p className="mt-2 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    {group.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <GalleryLightbox
                    items={group.items.map(item => ({
                      id: item.id,
                      type: item.type,
                      url: item.mediaFile?.url,
                      thumbnailUrl: item.thumbnailUrl,
                      title: item.title,
                      caption: item.caption,
                    }))}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
