import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

// DELETE — remove single image from product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id, imageId } = await params
  try {
    const deleted = await db.productImage.delete({ where: { id: imageId, productId: id } })

    // If deleted was primary, promote next image
    if (deleted.isPrimary) {
      const next = await db.productImage.findFirst({
        where: { productId: id },
        orderBy: { order: 'asc' },
      })
      if (next) {
        await db.productImage.update({ where: { id: next.id }, data: { isPrimary: true } })
      }
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}

// PATCH — set as primary
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id, imageId } = await params
  try {
    await db.productImage.updateMany({ where: { productId: id }, data: { isPrimary: false } })
    await db.productImage.update({ where: { id: imageId }, data: { isPrimary: true } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update primary' }, { status: 500 })
  }
}
