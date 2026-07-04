import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { MediaType } from '@prisma/client'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const createMediaSchema = z.object({
  name: z.string(),
  originalName: z.string(),
  type: z.nativeEnum(MediaType),
  url: z.string().url(),
  cloudinaryId: z.string(),
  thumbnailUrl: z.string().url().optional().nullable(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  duration: z.number().positive().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const json = await req.json()
    const parsed = createMediaSchema.parse(json)

    const media = await db.mediaFile.create({
      data: parsed,
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Media save error:', error)
    return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') as MediaType | null
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where = {
      ...(type ? { type } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    }

    const [items, total] = await Promise.all([
      db.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.mediaFile.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
