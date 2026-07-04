import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params;
  const gallery = await db.gallery.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' }, include: { mediaFile: true } } },
  })
  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ gallery })
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params;
  try {
    const json = await req.json()
    const data = updateSchema.parse(json)
    const gallery = await db.gallery.update({ where: { id }, data })
    return NextResponse.json({ gallery })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params;
    await db.gallery.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
