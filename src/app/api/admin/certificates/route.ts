import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CertType } from '@prisma/client'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const certSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().optional().nullable(),
  fileId: z.string().optional().nullable(),
  fileType: z.nativeEnum(CertType),
})

export async function GET() {
  try { await requireAdmin() } catch { return unauthorized() }
  const certs = await db.certificate.findMany({
    orderBy: { order: 'asc' },
    include: { file: { select: { url: true, thumbnailUrl: true, type: true } } },
  })
  return NextResponse.json({ certs })
}

export async function POST(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const json = await req.json()
    const data = certSchema.parse(json)
    const maxOrder = await db.certificate.aggregate({ _max: { order: true } })
    const order = (maxOrder._max.order ?? -1) + 1
    const cert = await db.certificate.create({ data: { ...data, order } })
    return NextResponse.json({ cert }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  // Reorder
  const { ids } = await req.json()
  await Promise.all(ids.map((id: string, i: number) => db.certificate.update({ where: { id }, data: { order: i } })))
  return NextResponse.json({ success: true })
}
