import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import slugify from 'slugify'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  scientificName: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  isOrganic: z.boolean().optional(),
  organicType: z.string().optional().nullable(),
  conventionalType: z.string().optional().nullable(),
  minOrderKg: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  order: z.number().int().optional(),
})

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      images: {
        include: { mediaFile: { select: { id: true, url: true, thumbnailUrl: true, name: true, width: true, height: true } } },
        orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
      },
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  try {
    const json = await req.json()
    const parsed = patchSchema.parse(json)
    const { categoryIds, slug: rawSlug, name, isOrganic, organicType, ...rest } = parsed

    // Derive isOrganic from organicType presence
    const derivedIsOrganic = organicType !== undefined
      ? !!organicType?.trim()
      : isOrganic

    // Build slug if name is changing
    let slug: string | undefined
    if (rawSlug !== undefined) {
      slug = rawSlug?.trim() || (name ? await generateSlug(name, id) : undefined)
    } else if (name) {
      const current = await db.product.findUnique({ where: { id }, select: { name: true } })
      if (current && current.name !== name) {
        slug = await generateSlug(name, id)
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(organicType !== undefined ? { organicType: organicType?.trim() || null } : {}),
        ...(organicType !== undefined ? { isOrganic: derivedIsOrganic } : {}),
        ...rest,
        ...(categoryIds !== undefined ? {
          categories: {
            deleteMany: {},
            create: categoryIds.map(cid => ({ categoryId: cid })),
          },
        } : {}),
      },
      include: {
        categories: { include: { category: true } },
        images: {
          include: { mediaFile: { select: { id: true, url: true, thumbnailUrl: true, name: true } } },
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
      },
    })
    return NextResponse.json({ product })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  try {
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
