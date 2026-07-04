import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import slugify from 'slugify'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const productSchema = z.object({
  name: z.string().min(1),
  scientificName: z.string().optional().nullable(),
  slug: z.string().optional(), // auto-generated if absent
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  isOrganic: z.boolean().default(false),
  organicType: z.string().optional().nullable(),
  conventionalType: z.string().optional().nullable(),
  minOrderKg: z.number().int().positive().default(500),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  // Images handled separately via productImages
})

// Derive isOrganic from organicType presence
function deriveIsOrganic(data: { organicType?: string | null, isOrganic?: boolean }) {
  if (data.organicType?.trim()) return true
  return data.isOrganic ?? false
}

async function generateSlug(name: string, excludeId?: string) {
  const base = slugify(name, { lower: true, strict: true })
  let slug = base; let i = 1
  while (true) {
    const existing = await db.product.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) break
    slug = `${base}-${i++}`
  }
  return slug
}

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  const sp = req.nextUrl.searchParams
  const categoryId = sp.get('categoryId')
  const status = sp.get('status') // 'active' | 'inactive'
  const featured = sp.get('featured')
  const search = sp.get('search')
  const page = parseInt(sp.get('page') || '1')
  const limit = 30

  const where: Prisma.ProductWhereInput = {
    ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {}),
    ...(featured === 'true' ? { isFeatured: true } : {}),
    ...(categoryId ? { categories: { some: { categoryId } } } : {}),
    ...(search ? { OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { scientificName: { contains: search, mode: 'insensitive' } },
    ]} : {}),
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { order: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: { include: { category: true } },
        images: {
          where: { isPrimary: true },
          include: { mediaFile: { select: { url: true } } },
          take: 1,
        },
      },
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const json = await req.json()
    const { categoryIds, slug: rawSlug, ...data } = productSchema.parse(json)
    const slug = rawSlug?.trim() || await generateSlug(data.name)
    const max = await db.product.aggregate({ _max: { order: true } })
    const order = (max._max.order ?? -1) + 1

    const product = await db.product.create({
      data: {
        ...data,
        isOrganic: deriveIsOrganic(data),
        slug,
        order,
        categories: { create: categoryIds.map(cid => ({ categoryId: cid })) },
      },
      include: { categories: { include: { category: true } }, images: true },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
