import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CertType } from '@prisma/client'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

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

export const PATCH = withAdminAuth(
  withValidation(updateSchema, async (_req, ctx, _adminId, data) => {
    const { id } = await ctx.params
    try {
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
      return apiError('Update failed', 500, err)
    }
  }),
)

export const DELETE = withAdminAuth(async (_req, ctx) => {
  try {
    const { id } = await ctx.params
    await db.certificate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return apiError('Delete failed', 500, err)
  }
})
