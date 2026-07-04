import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const category = await db.category.update({ where: { id }, data: { name: name.trim() } })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params
    // Disallow delete if products are using this category
    const count = await db.productCategory.count({ where: { categoryId: id } })
    if (count > 0) {
      return NextResponse.json({ error: `Cannot delete: used by ${count} product(s)` }, { status: 400 })
    }
    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
