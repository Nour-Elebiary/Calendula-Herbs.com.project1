import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/security'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function POST(req: NextRequest) {
  let adminId: string
  try { adminId = await requireAdmin() } catch { return unauthorized() }

  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data

    const admin = await db.admin.findUnique({
      where: { id: adminId },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const valid = await verifyPassword(currentPassword, admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const strength = validatePasswordStrength(newPassword)
    if (!strength.valid) {
      return NextResponse.json({ error: strength.errors.join('. ') }, { status: 400 })
    }

    const newPasswordHash = await hashPassword(newPassword)

    await db.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newPasswordHash,
        lockedUntil: null,
        failedAttempts: 0,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CHANGE PASSWORD]', err)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
