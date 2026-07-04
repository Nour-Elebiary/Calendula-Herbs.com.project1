import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import slugify from 'slugify'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const schema = z.object({ name: z.string().min(1) })

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
  const { name } = schema.parse(await req.json())
  const base = slugify(name, { lower: true, strict: true })
  let slug = base; let i = 1
  while (await db.category.findUnique({ where: { slug } })) slug = `${base}-${i++}`
  const max = await db.category.aggregate({ _max: { order: true } })
  const order = (max._max.order ?? -1) + 1
  const category = await db.category.create({ data: { name, slug, order } })
  return NextResponse.json({ category }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { ids } = await req.json()
  await Promise.all(ids.map((id: string, i: number) => db.category.update({ where: { id }, data: { order: i } })))
  return NextResponse.json({ success: true })
}
