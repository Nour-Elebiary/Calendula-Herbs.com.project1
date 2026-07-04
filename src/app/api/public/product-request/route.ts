import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { productRequestRateLimit } from '@/lib/rate-limit'
import { sendProductRequestConfirmation, sendProductRequestNotification } from '@/lib/email'
import { extractSenderMeta, enrichWithCountry } from '@/lib/sender-meta'

const schema = z.object({
  productName: z.string().min(1, 'Product name is required').max(500),
  productDescription: z.string().max(2000).optional().nullable(),
  quantity: z.string().max(100).optional().nullable(),
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(320),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  usage: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
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
