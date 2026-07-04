import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  recoveryEmails: z.array(z.string().email()),
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

    const { recoveryEmails } = parsed.data

    await db.admin.update({
      where: { id: adminId },
      data: { recoveryEmails },
    })

    return NextResponse.json({ success: true, recoveryEmails })
  } catch (err) {
    console.error('[UPDATE RECOVERY EMAILS]', err)
    return NextResponse.json({ error: 'Failed to update recovery emails' }, { status: 500 })
  }
}
