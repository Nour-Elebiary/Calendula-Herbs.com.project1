import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

const updateSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  photoId: z.string().nullable().optional(),
  memberType: z.enum(['TEAM', 'BOARD']).optional(),
  contacts: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['EMAIL', 'PHONE', 'LINKEDIN', 'TWITTER', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'TELEGRAM', 'VIBER', 'WECHAT', 'SIGNAL', 'MESSENGER', 'LINE', 'DISCORD', 'YOUTUBE', 'TIKTOK', 'SNAPCHAT', 'WEBSITE', 'OTHER']),
    label: z.string().nullable().optional(),
    value: z.string(),
    icon: z.string().nullable().optional(),
  })).optional(),
})

export const GET = withAdminAuth(async (_req, ctx) => {
  try {
    const { id } = await ctx.params
    const member = await db.teamMember.findUnique({
      where: { id },
      include: {
        photo: { select: { url: true } },
        contacts: true,
      },
    })
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ member })
  } catch (err) {
    return apiError('Failed to fetch', 500, err)
  }
})

export const PATCH = withAdminAuth(
  withValidation(updateSchema, async (_req, ctx, _adminId, data) => {
    try {
      const { id } = await ctx.params
      const { contacts, ...mainData } = data
      const member = await db.teamMember.update({ where: { id }, data: mainData })
      if (contacts !== undefined) {
        await db.teamContact.deleteMany({ where: { memberId: id } })
        if (contacts.length > 0) {
          await db.teamContact.createMany({
            data: contacts.map(c => ({
              memberId: id,
              type: c.type,
              label: c.label || null,
              value: c.value,
              icon: c.icon || null,
            })),
          })
        }
      }
      return NextResponse.json({ member })
    } catch (err) {
      return apiError('Failed to update', 500, err)
    }
  }),
)

export const DELETE = withAdminAuth(async (_req, ctx) => {
  try {
    const { id } = await ctx.params
    await db.teamMember.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Failed to delete', 500, err)
  }
})
