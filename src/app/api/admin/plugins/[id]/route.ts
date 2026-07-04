import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  position: z.enum(['HEAD', 'BODY_END', 'FOOTER_FIXED', 'CHAT_WIDGET']).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  try {
    const json = await req.json()
    const data = patchSchema.parse(json)
    const plugin = await db.plugin.update({ where: { id }, data })
    return NextResponse.json({ plugin })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to update plugin' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  try {
    await db.plugin.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete plugin' }, { status: 500 })
  }
}
