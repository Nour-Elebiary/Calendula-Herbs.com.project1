import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  position: z.enum(['HEAD', 'BODY_END', 'FOOTER_FIXED', 'CHAT_WIDGET']),
  isActive: z.boolean().default(false),
})

export const GET = withAdminAuth(async () => {
  try {
    const plugins = await db.plugin.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ plugins })
  } catch (err) {
    return apiError('Failed to fetch plugins', 500, err)
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const json = await req.json()
    const data = createSchema.parse(json)
    const max = await db.plugin.aggregate({ _max: { order: true } })
    const order = (max._max.order ?? -1) + 1
    const plugin = await db.plugin.create({ data: { ...data, order } })
    return NextResponse.json({ plugin }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return apiError('Failed to create plugin', 500, err)
  }
})

// PATCH for bulk reorder
export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    const { ids } = await req.json()
    await Promise.all(
      ids.map((id: string, i: number) => db.plugin.update({ where: { id }, data: { order: i } }))
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Failed to reorder plugins', 500, err)
  }
})
