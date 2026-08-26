import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, withValidation, RouteContext, apiError } from '@/lib/route-helpers'

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export const PATCH = withAdminAuth(
  withValidation(patchSchema, async (req, ctx, _adminId, data) => {
    const { id } = await ctx.params
    const category = await db.category.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? {
          translations: {
            upsert: LOCALES.map(locale => ({
              where: { categoryId_locale: { categoryId: id, locale } },
              create: { locale, name: data.name! },
              update: { name: data.name! },
            })),
          },
        } : {}),
      },
    })
    return NextResponse.json({ category })
  }),
)

export const DELETE = withAdminAuth(async (_req, ctx) => {
  try {
    const { id } = await ctx.params
    const count = await db.productCategory.count({ where: { categoryId: id } })
    if (count > 0) {
      return NextResponse.json({ error: `Cannot delete: used by ${count} product(s)` }, { status: 400 })
    }
    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Delete failed', 500, err)
  }
})
