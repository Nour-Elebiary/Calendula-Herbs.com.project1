import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const reorderSchema = z.array(z.object({
  id: z.string(),
  order: z.number()
}))

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const json = await req.json()
    const data = reorderSchema.parse(json)
    
    await db.$transaction(
      data.map(item => db.teamMember.update({
        where: { id: item.id },
        data: { order: item.order }
      }))
    )
    
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Failed to reorder members' }, { status: 500 })
  }
}
