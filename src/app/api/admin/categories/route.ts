import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import slugify from 'slugify'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  const withCounts = req.nextUrl.searchParams.get('withCounts') === 'true'
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    ...(withCounts ? { include: { _count: { select: { products: true } } } } : {}),
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  const data = createSchema.parse(await req.json())
  const base = slugify(data.name, { lower: true, strict: true })
  let slug = base; let i = 1
  while (await db.category.findUnique({ where: { slug } })) slug = `${base}-${i++}`
  const max = await db.category.aggregate({ _max: { order: true } })
  const order = (max._max.order ?? -1) + 1
  const category = await db.category.create({
    data: {
      name: data.name, slug, order, description: data.description, imageId: data.imageId, parentId: data.parentId,
      translations: { create: LOCALES.map(locale => ({ locale, name: data.name })) },
    },
  })
  return NextResponse.json({ category }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { ids } = await req.json()
  await Promise.all(ids.map((id: string, i: number) => db.category.update({ where: { id }, data: { order: i } })))
  return NextResponse.json({ success: true })
}
