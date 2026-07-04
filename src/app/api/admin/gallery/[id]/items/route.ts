import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { GalleryItemType, GallerySection } from '@prisma/client'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const addItemSchema = z.object({
  type: z.nativeEnum(GalleryItemType),
  section: z.nativeEnum(GallerySection).optional().nullable(),
  mediaFileId: z.string().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params;
  try {
    const json = await req.json()
    const data = addItemSchema.parse(json)

    let externalId: string | undefined
    let thumbnailUrl: string | undefined

    // YouTube oEmbed — extract video ID and thumbnail
    if (data.type === 'YOUTUBE' && data.externalUrl) {
      const ytMatch = data.externalUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )
      if (ytMatch) {
        externalId = ytMatch[1]
        thumbnailUrl = `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`
      }
    }

    const maxOrder = await db.galleryItem.aggregate({
      _max: { order: true },
      where: { galleryId: id },
    })
    const order = (maxOrder._max.order ?? -1) + 1

    const item = await db.galleryItem.create({
      data: {
        galleryId: id,
        type: data.type,
        section: data.section ?? null,
        mediaFileId: data.mediaFileId ?? null,
        externalUrl: data.externalUrl ?? null,
        externalId: externalId ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        title: data.title ?? null,
        caption: data.caption ?? null,
        order,
      },
      include: { mediaFile: true },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params;
  // Reorder items
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids must be array' }, { status: 400 })
    await Promise.all(ids.map((itemId: string, index: number) =>
      db.galleryItem.update({ where: { id: itemId }, data: { order: index } })
    ))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 })
  }
}
