import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import slugify from 'slugify'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

const createGallerySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const GET = withAdminAuth(async () => {
  const galleries = await db.gallery.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { items: true } } },
  })
  return NextResponse.json({ galleries })
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const json = await req.json()
    const { name, description } = createGallerySchema.parse(json)

    // Auto-generate unique slug
    const base = slugify(name, { lower: true, strict: true })
    let slug = base
    let i = 1
    while (await db.gallery.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`
    }

    const maxOrder = await db.gallery.aggregate({ _max: { order: true } })
    const order = (maxOrder._max.order ?? -1) + 1

    const gallery = await db.gallery.create({ data: { name, slug, description, order } })
    return NextResponse.json({ gallery }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return apiError('Failed to create gallery', 500, err)
  }
})

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  // Reorder: expects { ids: string[] } in display order
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids must be an array' }, { status: 400 })
    await Promise.all(
      ids.map((id: string, index: number) =>
        db.gallery.update({ where: { id }, data: { order: index } })
      )
    )
    return NextResponse.json({ success: true })
  } catch {
    return apiError('Reorder failed', 500)
  }
})
