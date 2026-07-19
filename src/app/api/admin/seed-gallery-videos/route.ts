import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// All video items from Tasks List.txt (item 9-1)
const VIDEO_ITEMS = [
  // YouTube videos — INTERVIEWS_TV
  { externalUrl: 'https://youtu.be/GlmljM2BUwQ?si=KA-3fJsEMKNBkfG-', type: 'YOUTUBE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://youtu.be/3ZE6JAHw8hI?si=RHXMvTZG7UpM0j-F', type: 'YOUTUBE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://youtu.be/rvwUCZmODrs?si=YVOr2lL6yKu1qFbe', type: 'YOUTUBE' as const, section: 'INTERVIEWS_TV' },
  // Google Drive — INTERVIEWS_TV
  { externalUrl: 'https://drive.google.com/file/d/1hGcKAILCYr1pt8oXrGbKCfa4YiteOtt9/view?usp=sharing', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://drive.google.com/file/d/1b7CbySTeAXITT9R4FhimOjzEZn1E5Kod/view?usp=drive_link', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://drive.google.com/file/d/1WW_eE7-N4S3dfSdnQzXSfuUEzyBQo8R1/view?usp=drive_link', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://drive.google.com/file/d/1LDvMeZsTiXlFBzbaox0CaVjAZTzDTMsI/view?usp=sharing', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' }, // also EVENTS
  { externalUrl: 'https://drive.google.com/file/d/1jA7zVTna1fz2BbQ9l6i0nN5yniH3VsbA/view?usp=drive_link', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://drive.google.com/file/d/1-omRSlPaa_0TYZG0wMcQLrqeb6MLpo5n/view?usp=sharing', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' }, // also EVENTS
  { externalUrl: 'https://drive.google.com/file/d/1zKWX20t-RyEytDrugFIW530VDvyG08rG/view?usp=drive_link', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://drive.google.com/file/d/1OBuradkrOzHjrnd3EWWKvNkzVNpcGIrf/view?usp=sharing', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' }, // also EVENTS
  { externalUrl: 'https://drive.google.com/file/d/1jXtQykqIdnVxP9ms-rxaZncEfi9Q3kdD/view?usp=sharing', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
  { externalUrl: 'https://drive.google.com/file/d/14OWd8INcKEV2TFZfuYvzpt3xFVTdkpK1/view?usp=sharing', type: 'GOOGLE_DRIVE' as const, section: 'INTERVIEWS_TV' },
]

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? null
}

function extractDriveId(url: string): string | null {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return m?.[1] ?? null
}

export async function GET() {
  try {
    const results: string[] = []

    // Find or create the "Interviews & TV" gallery
    let gallery = await db.gallery.findFirst({ where: { slug: 'interviews-tv' } })
    if (!gallery) {
      const maxOrder = await db.gallery.aggregate({ _max: { order: true } })
      const order = (maxOrder._max.order ?? -1) + 1
      gallery = await db.gallery.create({
        data: {
          name: 'Interviews & TV',
          slug: 'interviews-tv',
          description: 'TV interviews and media appearances featuring Calendula Herbs',
          isActive: true,
          order,
        },
      })
      results.push(`Created gallery: Interviews & TV`)
    } else {
      results.push(`Found gallery: ${gallery.name} (id: ${gallery.id})`)
    }

    for (let i = 0; i < VIDEO_ITEMS.length; i++) {
      const { externalUrl, type, section } = VIDEO_ITEMS[i]

      let externalId: string | null = null
      let thumbnailUrl: string | null = null

      if (type === 'YOUTUBE') {
        externalId = extractYouTubeId(externalUrl)
        if (externalId) thumbnailUrl = `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`
      } else if (type === 'GOOGLE_DRIVE') {
        externalId = extractDriveId(externalUrl)
        if (externalId) thumbnailUrl = `https://drive.google.com/thumbnail?id=${externalId}&sz=w480`
      }

      // Skip if already exists
      const exists = await db.galleryItem.findFirst({
        where: { galleryId: gallery.id, externalUrl },
      })
      if (exists) {
        results.push(`Skipped (exists): ${externalUrl}`)
        continue
      }

      const maxOrder = await db.galleryItem.aggregate({
        _max: { order: true },
        where: { galleryId: gallery.id },
      })
      const order = (maxOrder._max.order ?? -1) + 1

      await db.galleryItem.create({
        data: {
          galleryId: gallery.id,
          type,
          section: section as import('@prisma/client').GallerySection,
          externalUrl,
          externalId,
          thumbnailUrl,
          isActive: true,
          order,
        },
      })
      results.push(`Created: [${type}] ${externalId ?? externalUrl}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('[SEED GALLERY VIDEOS]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
