import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { cartRateLimit } from '@/lib/rate-limit'
import { sendCartConfirmation, sendCartNotification } from '@/lib/email'
import { extractSenderMeta, enrichWithCountry } from '@/lib/sender-meta'

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email").max(320, "Email too long"),
  phone: z.string().max(50, "Phone too long").optional().nullable(),
  company: z.string().max(200, "Company too long").optional().nullable(),
  country: z.string().max(100, "Country too long").optional().nullable(),
  notes: z.string().max(2000, "Notes too long").optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().min(1)
  })).min(1, "Cart is empty"),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const data = schema.parse(json)

    const meta = await enrichWithCountry(extractSenderMeta(req))

    const { success } = await cartRateLimit.limit(meta.ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    await db.cartInquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        notes: data.notes,
        itemsJson: JSON.stringify(data.items),
      }
    })

    const contactSetting = await db.contactSetting.findUnique({ where: { id: 'main' } })

    const items = data.items.map(i => ({ productName: i.productName, quantity: i.quantity }))

    await Promise.allSettled([
      sendCartConfirmation(data.email, data.name, items),
      contactSetting?.managingEmails?.length
        ? sendCartNotification(contactSetting.managingEmails, data, items, meta)
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit cart inquiry' }, { status: 500 })
  }
}
