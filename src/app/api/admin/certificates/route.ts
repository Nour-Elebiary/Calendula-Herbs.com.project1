import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CertType } from '@prisma/client'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

const certSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  fileId: z.string().optional().nullable(),
  logoFileId: z.string().optional().nullable(),
  fileType: z.nativeEnum(CertType),
})

export const GET = withAdminAuth(async () => {
  const certs = await db.certificate.findMany({
    orderBy: { order: 'asc' },
    include: {
      file: { select: { url: true, thumbnailUrl: true, type: true } },
      logo: { select: { url: true, thumbnailUrl: true } },
      translations: true,
    },
  })
  return NextResponse.json({ certs })
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const json = await req.json()
    const data = certSchema.parse(json)
    const maxOrder = await db.certificate.aggregate({ _max: { order: true } })
    const order = (maxOrder._max.order ?? -1) + 1
    const cert = await db.certificate.create({
      data: {
        ...data,
        order,
        translations: {
          create: LOCALES.map(locale => ({
            locale,
            title: data.title,
            issuer: data.issuer,
            description: data.description,
          })),
        },
      },
      include: { translations: true },
    })
    return NextResponse.json({ cert }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return apiError('Failed to create certificate', 500, err)
  }
})

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  // Reorder
  const { ids } = await req.json()
  await Promise.all(ids.map((id: string, i: number) => db.certificate.update({ where: { id }, data: { order: i } })))
  return NextResponse.json({ success: true })
})
