import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const addImageSchema = z.object({
  mediaFileId: z.string().min(1),
  isPrimary: z.boolean().optional().default(false),
})

// GET all images for a product
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  const images = await db.productImage.findMany({
    where: { productId: id },
    include: { mediaFile: { select: { id: true, url: true, thumbnailUrl: true, name: true, width: true, height: true } } },
    orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
  })
  return NextResponse.json({ images })
}

// POST — add image to product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  try {
    const { mediaFileId, isPrimary } = addImageSchema.parse(await req.json())

    // If setting as primary, unset others
    if (isPrimary) {
      await db.productImage.updateMany({ where: { productId: id }, data: { isPrimary: false } })
    }

    const max = await db.productImage.aggregate({ where: { productId: id }, _max: { order: true } })
    const order = (max._max.order ?? -1) + 1

    const image = await db.productImage.create({
      data: { productId: id, mediaFileId, isPrimary: isPrimary ?? false, order },
      include: { mediaFile: { select: { id: true, url: true, thumbnailUrl: true, name: true } } },
    })
    return NextResponse.json({ image }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}

// PATCH — reorder images
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  const { ids } = await req.json()
  await Promise.all(ids.map((imgId: string, i: number) =>
    db.productImage.update({ where: { id: imgId, productId: id }, data: { order: i } })
  ))
  return NextResponse.json({ success: true })
}
