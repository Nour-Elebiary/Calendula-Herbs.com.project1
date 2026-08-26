import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  memberType: z.enum(['TEAM', 'BOARD']),
})

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'TEAM' | 'BOARD' | null
    const where = type === 'TEAM' || type === 'BOARD' ? { memberType: type } : {}
    const members = await db.teamMember.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        photo: { select: { url: true } },
        contacts: true,
      },
    })
    return NextResponse.json({ members })
  } catch (err) {
    return apiError('Failed to fetch team members', 500, err)
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const json = await req.json()
    const data = createSchema.parse(json)
    const count = await db.teamMember.count({ where: { memberType: data.memberType } })
    const member = await db.teamMember.create({ data: { ...data, order: count } })
    return NextResponse.json({ member }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return apiError('Failed to create team member', 500, err)
  }
})
