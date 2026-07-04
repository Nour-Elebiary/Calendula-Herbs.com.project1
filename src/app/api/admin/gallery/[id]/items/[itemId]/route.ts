import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  try { await requireAdmin() } catch { return unauthorized() }
  await db.galleryItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  try { await requireAdmin() } catch { return unauthorized() }
  const { title, caption, isActive, section } = await req.json()
  const item = await db.galleryItem.update({
    where: { id: itemId },
    data: {
      ...(title !== undefined && { title }),
      ...(caption !== undefined && { caption }),
      ...(isActive !== undefined && { isActive }),
      ...(section !== undefined && { section }),
    },
    include: { mediaFile: true },
  })
  return NextResponse.json({ item })
}
