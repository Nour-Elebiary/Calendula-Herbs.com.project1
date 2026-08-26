import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  position: z.enum(['HEAD', 'BODY_END', 'FOOTER_FIXED', 'CHAT_WIDGET']).optional(),
  isActive: z.boolean().optional(),
})

export const PATCH = withAdminAuth(
  withValidation(patchSchema, async (_req, ctx, _adminId, data) => {
    const { id } = await ctx.params
    try {
      const plugin = await db.plugin.update({ where: { id }, data })
      return NextResponse.json({ plugin })
    } catch (err) {
      return apiError('Failed to update plugin', 500, err)
    }
  }),
)

export const DELETE = withAdminAuth(async (_req, ctx) => {
  const { id } = await ctx.params
  try {
    await db.plugin.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Failed to delete plugin', 500, err)
  }
})
