import React from 'react'
import { db } from '@/lib/db'
import { ImageIcon } from 'lucide-react'
import { GalleryCarousel } from '@/components/public/GalleryCarousel'
import { Template1Carousel } from '@/components/public/carousels/Template1Carousel'
import { Template2Carousel } from '@/components/public/carousels/Template2Carousel'
import { Template2PageAdapter } from '@/components/public/carousels/Template2PageAdapter'
import { Template3Carousel } from '@/components/public/carousels/Template3Carousel'
import { getCarouselStyle, type CarouselStyle } from '@/lib/settings'
import { CarouselItem } from '@/components/public/carousels/types'
import { GallerySection } from '@prisma/client'

export const metadata = {
  title: 'Galleries | Calendula Herbs',
  description: 'Explore our farms, processing facilities, and products through our media galleries.',
}

const SECTION_ORDER: GallerySection[] = [
  'EVENTS',
  'INTERVIEWS_TV',
  'VISITS',
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
  VISITS: {
    label: 'Visits',
    description: 'Visits to our farms, facilities, and partners around the world.',
  },
}

function mapItems(items: any[]): CarouselItem[] {
  return items.map(item => ({
    id: item.id,
    type: item.type,
    url: item.mediaFile?.url,
    thumbnailUrl: item.thumbnailUrl
      || (item.type === 'YOUTUBE' && item.externalId ? `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg` : undefined)
      || (item.type === 'GOOGLE_DRIVE' && item.externalId ? `https://drive.google.com/thumbnail?id=${item.externalId}&sz=w480` : undefined),
    title: item.title,
    caption: item.caption,
    externalId: item.externalId,
    externalUrl: item.externalUrl,
  }))
}

export default async function GalleriesPage() {
  let carouselStyle: CarouselStyle = 'original'
  let items: any[] = []
  try {
    const [style, galleryItems] = await Promise.all([
      getCarouselStyle(),
      db.galleryItem.findMany({
        where: {
          isActive: true,
          section: { not: null },
          gallery: { isActive: true },
        },
        include: { mediaFile: true, gallery: true },
        orderBy: [{ section: 'asc' }, { order: 'asc' }],
      }),
    ])
    carouselStyle = style
    items = galleryItems
  } catch (err) {
    console.error('[GALLERIES PAGE] Failed to load gallery data:', err)
  }

  const grouped = SECTION_ORDER
    .map(section => ({
      section,
      ...SECTION_META[section],
      items: items.filter(item => item.section === section),
    }))
    .filter(group => group.items.length > 0)

  const hasContent = grouped.length > 0

  const renderCarousel = (group: { section: GallerySection; label: string; description: string; items: any[] }) => {
    const carouselItems = mapItems(group.items)
    const props = {
      items: carouselItems,
      sectionLabel: group.label,
      sectionDescription: group.description,
    }

    switch (carouselStyle) {
      case 'template1':
        return <Template1Carousel key={group.section} {...props} />
      case 'template2':
        return <Template2Carousel key={group.section} {...props} />
      case 'template3':
        return <Template3Carousel key={group.section} {...props} />
      default:
        return <GalleryCarousel key={group.section} {...props} />
    }
  }

  return (
    <div className="page-root">
      <div className="page-content">
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--galleries" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card">
              <h1 className="hero-page__title">
                Media Galleries
              </h1>
              <p className="hero-page__desc">
                A visual journey through our farms, state-of-the-art processing facilities, and premium products.
              </p>
            </div>
          </div>
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
            carouselStyle === 'template2' ? (
              <Template2PageAdapter groups={grouped.map(g => ({
                section: g.section,
                label: g.label,
                description: g.description,
                items: mapItems(g.items),
              }))} />
            ) : (
              grouped.map(group => renderCarousel(group))
            )
          )}
        </div>
      </div>
    </div>
  )
}
