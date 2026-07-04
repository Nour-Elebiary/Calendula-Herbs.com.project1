import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CertType } from '@prisma/client'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  issuer: z.string().optional().nullable(),
  fileId: z.string().optional().nullable(),
  fileType: z.nativeEnum(CertType).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params;
  try {
    const data = updateSchema.parse(await req.json())
    const cert = await db.certificate.update({ where: { id }, data })
    return NextResponse.json({ cert })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params;
    await db.certificate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
