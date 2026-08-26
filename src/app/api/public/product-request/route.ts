import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { productRequestRateLimit } from '@/lib/rate-limit'
import { sendProductRequestConfirmation, sendProductRequestNotification } from '@/lib/email'
import { extractSenderMeta, enrichWithCountry } from '@/lib/sender-meta'
import { sanitizeHtml } from '@/lib/security'

const schema = z.object({
  productName: z.string().min(1, 'Product name is required').max(500).transform(sanitizeHtml),
  productDescription: z.string().max(2000).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
  quantity: z.string().max(100).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
  name: z.string().min(1, 'Name is required').max(200).transform(sanitizeHtml),
  email: z.string().email('Invalid email').max(320).transform(sanitizeHtml),
  phone: z.string().max(50).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
  company: z.string().max(200).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
  country: z.string().max(100).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
  usage: z.string().max(500).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
  notes: z.string().max(2000).optional().nullable().transform(v => v ? sanitizeHtml(v) : v),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const data = schema.parse(json)

    const meta = await enrichWithCountry(extractSenderMeta(req))

    const { success } = await productRequestRateLimit.limit(meta.ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    await db.productRequest.create({
      data: {
        productName: data.productName,
        productDescription: data.productDescription,
        quantity: data.quantity,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        usage: data.usage,
        notes: data.notes,
      }
    })

    const contactSetting = await db.contactSetting.findUnique({ where: { id: 'main' } })

    await Promise.allSettled([
      sendProductRequestConfirmation(data.email, data.name, data.productName),
      contactSetting?.managingEmails?.length
        ? sendProductRequestNotification(contactSetting.managingEmails, data, meta)
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit product request' }, { status: 500 })
  }
}
