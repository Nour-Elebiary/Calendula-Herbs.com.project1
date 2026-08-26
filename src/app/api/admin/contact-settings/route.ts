import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, apiError } from '@/lib/route-helpers'

const contactMethodSchema = z.object({
  type: z.enum(['whatsapp', 'telegram', 'viber', 'skype', 'wechat', 'signal', 'messenger', 'line', 'discord', 'other']),
  value: z.string().min(1),
  linkMode: z.enum(['auto', 'manual']),
  manualLink: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
})

const schema = z.object({
  managingEmails: z.array(z.string()).optional(),
  mapAddress: z.string().nullable().optional(),
  mapLat: z.number().nullable().optional(),
  mapLng: z.number().nullable().optional(),
  phones: z.array(z.object({ number: z.string(), ownerName: z.string().optional() })).optional(),
  publicEmails: z.array(z.string()).optional(),
  businessHours: z.string().nullable().optional(),
  autoReplySubject: z.string().nullable().optional(),
  autoReplyMessage: z.string().nullable().optional(),
  formEnabled: z.boolean().optional(),
  contactMethods: z.array(contactMethodSchema).nullable().optional(),
})

export const GET = withAdminAuth(async () => {
  try {
    const contact = await db.contactSetting.findUnique({ where: { id: 'main' } })
    return NextResponse.json({ contact })
  } catch (err) {
    return apiError('Failed to fetch contact settings', 500, err)
  }
})

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    const json = await req.json()
    const data = schema.parse(json)
    const dbData = JSON.parse(JSON.stringify(data))
    const contact = await db.contactSetting.upsert({
      where: { id: 'main' },
      update: dbData,
      create: { id: 'main', ...dbData },
    })
    return NextResponse.json({ contact })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    return apiError('Failed to save contact settings', 500, err)
  }
})
