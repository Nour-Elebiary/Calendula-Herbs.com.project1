'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function revokeSession(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await db.adminSession.updateMany({
    where: { 
      id: sessionId,
      adminId: session.user.id
    },
    data: { revokedAt: new Date() }
  })

  revalidatePath('/admin/dashboard/profile')
}

export async function revokeAllOtherSessions(currentSessionTokenHash: string | undefined) {
  const session = await auth()
  if (!session?.user?.id || !currentSessionTokenHash) return

  await db.adminSession.updateMany({
    where: { 
      adminId: session.user.id,
      tokenHash: { not: currentSessionTokenHash },
      revokedAt: null
    },
    data: { revokedAt: new Date() }
  })

  revalidatePath('/admin/dashboard/profile')
}
