import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sampleRateLimit } from '@/lib/rate-limit'
import { sendSampleConfirmation, sendSampleNotification } from '@/lib/email'
import { extractSenderMeta, enrichWithCountry } from '@/lib/sender-meta'

const schema = z.object({
  productName: z.string().min(1, "Product name is required").max(500, "Product name too long"),
  quantity: z.string().max(100).optional().nullable(),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email").max(320, "Email too long"),
  company: z.string().max(200, "Company too long").optional().nullable(),
  address: z.string().max(1000, "Address too long").optional().nullable(),
  shippingBy: z.enum(["buyer", "calendula"]),
  notes: z.string().max(2000, "Notes too long").optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const data = schema.parse(json)

    const meta = await enrichWithCountry(extractSenderMeta(req))

    const { success } = await sampleRateLimit.limit(meta.ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    await db.sampleRequest.create({
      data: {
        productName: data.productName,
        quantity: data.quantity,
        name: data.name,
        email: data.email,
        company: data.company,
        address: data.address,
        shippingBy: data.shippingBy,
        notes: data.notes,
      }
    })

    const contactSetting = await db.contactSetting.findUnique({ where: { id: 'main' } })

    await Promise.allSettled([
      sendSampleConfirmation(data.email, data.name, data.productName),
      contactSetting?.managingEmails?.length
        ? sendSampleNotification(contactSetting.managingEmails, data, meta)
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit sample request' }, { status: 500 })
  }
}
