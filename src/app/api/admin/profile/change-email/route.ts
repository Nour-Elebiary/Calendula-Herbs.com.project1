import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { verifyPassword } from '@/lib/security'

const schema = z.object({
  newEmail: z.string().email(),
  currentPassword: z.string().min(1),
})

export async function PATCH(req: NextRequest) {
  let adminId: string
  try { adminId = await requireAdmin() } catch { return unauthorized() }

  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { newEmail, currentPassword } = parsed.data

    const admin = await db.admin.findUnique({ where: { id: adminId } })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const valid = await verifyPassword(currentPassword, admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const existing = await db.admin.findUnique({ where: { email: newEmail } })
    if (existing && existing.id !== adminId) {
      return NextResponse.json({ error: 'Email already in use by another admin' }, { status: 409 })
    }

    await db.admin.update({
      where: { id: adminId },
      data: { email: newEmail },
    })

    await db.adminSession.updateMany({
      where: { adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CHANGE EMAIL]', err)
    return NextResponse.json({ error: 'Failed to change email' }, { status: 500 })
  }
}
