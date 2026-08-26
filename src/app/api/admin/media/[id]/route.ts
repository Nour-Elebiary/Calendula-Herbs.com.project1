import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

export const PATCH = withAdminAuth(async (req, ctx) => {
  const { id } = await ctx.params
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const media = await db.mediaFile.update({
      where: { id },
      data: { name: name.trim() },
    })
    return NextResponse.json({ media })
  } catch (err) {
    return apiError('Failed to rename media', 500, err)
  }
})

export const DELETE = withAdminAuth(async (_req, ctx) => {
  try {
    const { id } = await ctx.params
    const media = await db.mediaFile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            galleryItems: true,
            productImages: true,
            teamMembers: true,
            certFiles: true,
            certLogos: true,
          },
        },
      },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const usageCount =
      media._count.galleryItems +
      media._count.productImages +
      media._count.teamMembers +
      media._count.certFiles +
      media._count.certLogos

    if (usageCount > 0) {
      return NextResponse.json({
        error: `Cannot delete: Media is in use in ${usageCount} place(s).`,
      }, { status: 400 })
    }

    // Delete from Cloudinary
    if (media.type === 'VIDEO' || media.type === 'AUDIO') {
      await cloudinary.uploader.destroy(media.cloudinaryId, { resource_type: 'video' })
    } else if (media.type === 'IMAGE' || media.type === 'PDF') {
      await cloudinary.uploader.destroy(media.cloudinaryId, { resource_type: 'image' })
    } else {
      await cloudinary.uploader.destroy(media.cloudinaryId, { resource_type: 'raw' })
    }

    await db.mediaFile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Failed to delete media', 500, err)
  }
})
