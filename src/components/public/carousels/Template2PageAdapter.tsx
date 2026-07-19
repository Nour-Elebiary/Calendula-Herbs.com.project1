'use client'

import { useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Template2Carousel } from './Template2Carousel'
import type { CarouselItem } from './types'

type RawGalleryItem = {
  id: string
  type: string
  url?: string | null
  thumbnailUrl?: string | null
  title?: string | null
  caption?: string | null
  externalId?: string | null
  externalUrl?: string | null
  mediaFile?: { url?: string | null; thumbnailUrl?: string | null } | null
}

type SectionGroup = {
  section: string
  label: string
  description: string
  items: RawGalleryItem[]
}

type Props = {
  groups: SectionGroup[]
}

function toCarouselItem(item: RawGalleryItem): CarouselItem {
  return {
    id: item.id,
    type: item.type,
    url: item.url || item.mediaFile?.url,
    thumbnailUrl: item.thumbnailUrl
      || item.mediaFile?.thumbnailUrl
      || (item.type === 'YOUTUBE' && item.externalId ? `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg` : undefined)
      || (item.type === 'GOOGLE_DRIVE' && item.externalId ? `https://drive.google.com/thumbnail?id=${item.externalId}&sz=w480` : undefined),
    title: item.title,
    caption: item.caption,
    externalId: item.externalId,
    externalUrl: item.externalUrl,
  }
}

export function Template2PageAdapter({ groups }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeSection = searchParams.get('section') || groups[0]?.section || ''

  const currentGroup = useMemo(
    () => groups.find(g => g.section === activeSection) || groups[0],
    [groups, activeSection]
  )

  const setSection = (section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2" style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
        {groups.map(g => (
          <button
            key={g.section}
            onClick={() => setSection(g.section)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              background: g.section === activeSection ? 'var(--color-calendula-500, #DC7E18)' : 'transparent',
              color: g.section === activeSection ? '#fff' : 'var(--color-text-secondary)',
              border: g.section === activeSection ? 'none' : '1px solid var(--color-border-default, #d4d4d4)',
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {currentGroup && (
        <Template2Carousel
          key={currentGroup.section}
          items={currentGroup.items.map(toCarouselItem)}
          sectionLabel={currentGroup.label}
          sectionDescription={currentGroup.description}
        />
      )}
    </div>
  )
}
