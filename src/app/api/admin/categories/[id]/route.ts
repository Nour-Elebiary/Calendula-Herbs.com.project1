import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  const { id } = await params
  const data = patchSchema.parse(await req.json())
  const category = await db.category.update({
    where: { id },
    data: {
      ...data,
      ...(data.name ? {
        translations: {
          upsert: LOCALES.map(locale => ({
            where: { categoryId_locale: { categoryId: id, locale } },
            create: { locale, name: data.name! },
            update: { name: data.name! },
          })),
        },
      } : {}),
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params
    // Disallow delete if products are using this category
    const count = await db.productCategory.count({ where: { categoryId: id } })
    if (count > 0) {
      return NextResponse.json({ error: `Cannot delete: used by ${count} product(s)` }, { status: 400 })
    }
    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
