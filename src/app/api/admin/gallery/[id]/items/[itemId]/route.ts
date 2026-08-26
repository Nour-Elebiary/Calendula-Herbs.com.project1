import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

export const DELETE = withAdminAuth(async (_req, ctx) => {
  const { itemId } = await ctx.params
  try {
    await db.galleryItem.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Failed to delete item', 500, err)
  }
})

export const PATCH = withAdminAuth(async (req, ctx) => {
  const { itemId } = await ctx.params
  try {
    const { title, caption, isActive, section } = await req.json()
    const item = await db.galleryItem.update({
      where: { id: itemId },
      data: {
        ...(title !== undefined && { title }),
        ...(caption !== undefined && { caption }),
        ...(isActive !== undefined && { isActive }),
        ...(section !== undefined && { section }),
      },
      include: { mediaFile: true },
    })
    return NextResponse.json({ item })
  } catch (err) {
    return apiError('Failed to update item', 500, err)
  }
})
