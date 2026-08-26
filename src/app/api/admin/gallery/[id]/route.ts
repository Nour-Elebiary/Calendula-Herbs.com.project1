import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export const GET = withAdminAuth(async (_req, ctx) => {
  const { id } = await ctx.params
  const gallery = await db.gallery.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' }, include: { mediaFile: true } } },
  })
  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ gallery })
})

export const PATCH = withAdminAuth(
  withValidation(updateSchema, async (_req, ctx, _adminId, data) => {
    const { id } = await ctx.params
    try {
      const gallery = await db.gallery.update({ where: { id }, data })
      return NextResponse.json({ gallery })
    } catch (err) {
      return apiError('Update failed', 500, err)
    }
  }),
)

export const DELETE = withAdminAuth(async (_req, ctx) => {
  try {
    const { id } = await ctx.params
    await db.gallery.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Delete failed', 500, err)
  }
})
