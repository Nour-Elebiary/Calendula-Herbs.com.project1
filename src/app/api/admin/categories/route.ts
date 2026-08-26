import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import slugify from 'slugify'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

const patchSchema = z.object({
  ids: z.array(z.string()),
})

export const GET = withAdminAuth(async (req) => {
  const withCounts = req.nextUrl.searchParams.get('withCounts') === 'true'
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    ...(withCounts ? { include: { _count: { select: { products: true } } } } : {}),
  })
  return NextResponse.json({ categories })
})

export const POST = withAdminAuth(
  withValidation(createSchema, async (_, __, _adminId, data) => {
    try {
      const base = slugify(data.name, { lower: true, strict: true })
      let slug = base; let i = 1
      while (await db.category.findUnique({ where: { slug } })) slug = `${base}-${i++}`
      const max = await db.category.aggregate({ _max: { order: true } })
      const order = (max._max.order ?? -1) + 1
      const category = await db.category.create({
        data: {
          name: data.name, slug, order, description: data.description,
          imageId: data.imageId, parentId: data.parentId,
          translations: { create: LOCALES.map(locale => ({ locale, name: data.name })) },
        },
      })
      return NextResponse.json({ category }, { status: 201 })
    } catch (err) {
      return apiError('Failed to create category', 500, err)
    }
  })
)

export const PATCH = withAdminAuth(
  withValidation(patchSchema, async (_, __, _adminId, data) => {
    try {
      await Promise.all(
        data.ids.map((id: string, i: number) =>
          db.category.update({ where: { id }, data: { order: i } })
        )
      )
      return NextResponse.json({ success: true })
    } catch (err) {
      return apiError('Failed to reorder categories', 500, err)
    }
  })
)
