import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CertType } from '@prisma/client'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

const translationSchema = z.object({
  title: z.string().optional().nullable(),
  issuer: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  issuer: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  fileId: z.string().optional().nullable(),
  logoFileId: z.string().optional().nullable(),
  fileType: z.nativeEnum(CertType).optional(),
  isActive: z.boolean().optional(),
  translations: z.record(z.string(), translationSchema).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params;
  try {
    const json = await req.json()
    const data = updateSchema.parse(json)
    const { translations, ...fields } = data
    const cert = await db.certificate.update({
      where: { id },
      data: {
        ...fields,
        ...(translations ? {
          translations: {
            upsert: Object.entries(translations).map(([locale, tr]) => ({
              where: { certificateId_locale: { certificateId: id, locale } },
              create: { locale, ...tr },
              update: { ...tr },
            })),
          },
        } : {}),
      },
      include: { translations: true },
    })
    return NextResponse.json({ cert })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params;
    await db.certificate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
