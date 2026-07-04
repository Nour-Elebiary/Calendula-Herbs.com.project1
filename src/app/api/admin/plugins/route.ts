import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  position: z.enum(['HEAD', 'BODY_END', 'FOOTER_FIXED', 'CHAT_WIDGET']),
  isActive: z.boolean().default(false),
})

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  position: z.enum(['HEAD', 'BODY_END', 'FOOTER_FIXED', 'CHAT_WIDGET']).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function GET() {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const plugins = await db.plugin.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ plugins })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const json = await req.json()
    const data = createSchema.parse(json)
    const max = await db.plugin.aggregate({ _max: { order: true } })
    const order = (max._max.order ?? -1) + 1
    const plugin = await db.plugin.create({ data: { ...data, order } })
    return NextResponse.json({ plugin }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to create plugin' }, { status: 500 })
  }
}

// PATCH for bulk reorder
export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { ids } = await req.json()
    await Promise.all(
      ids.map((id: string, i: number) => db.plugin.update({ where: { id }, data: { order: i } }))
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to reorder plugins' }, { status: 500 })
  }
}
