import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { GalleryItemType, GallerySection } from '@prisma/client'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

const addItemSchema = z.object({
  type: z.nativeEnum(GalleryItemType),
  section: z.nativeEnum(GallerySection).optional().nullable(),
  mediaFileId: z.string().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
})

export const POST = withAdminAuth(
  withValidation(addItemSchema, async (_req, ctx, _adminId, data) => {
    const { id } = await ctx.params
    try {
      let externalId: string | undefined
      let thumbnailUrl: string | undefined

      if (data.type === 'YOUTUBE' && data.externalUrl) {
        const ytMatch = data.externalUrl.match(
          /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        )
        if (ytMatch) {
          externalId = ytMatch[1]
          thumbnailUrl = `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`
        }
      }

      if (data.type === 'GOOGLE_DRIVE' && data.externalUrl) {
        const gdMatch = data.externalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
        if (gdMatch) {
          externalId = gdMatch[1]
          thumbnailUrl = `https://drive.google.com/thumbnail?id=${externalId}&sz=w480`
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
      return apiError('Failed to add item', 500, err)
    }
  }),
)

export const PATCH = withAdminAuth(async (req, ctx) => {
  const { id } = await ctx.params
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids must be array' }, { status: 400 })
    await Promise.all(ids.map((itemId: string, index: number) =>
      db.galleryItem.update({ where: { id: itemId }, data: { order: index } })
    ))
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Reorder failed', 500, err)
  }
})
