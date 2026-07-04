import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { contactRateLimit } from '@/lib/rate-limit'
import { sendContactConfirmation, sendContactNotification } from '@/lib/email'
import { extractSenderMeta, enrichWithCountry } from '@/lib/sender-meta'

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email").max(320, "Email too long"),
  phone: z.string().max(50, "Phone too long").optional().nullable(),
  company: z.string().max(200, "Company too long").optional().nullable(),
  country: z.string().max(100, "Country too long").optional().nullable(),
  subject: z.string().max(200, "Subject too long").optional().nullable(),
  message: z.string().min(1, "Message is required").max(5000, "Message too long"),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const data = schema.parse(json)

    const meta = await enrichWithCountry(extractSenderMeta(req))

    const { success } = await contactRateLimit.limit(meta.ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        subject: data.subject,
        message: data.message,
      }
    })

    const contactSetting = await db.contactSetting.findUnique({ where: { id: 'main' } })

    await Promise.allSettled([
      sendContactConfirmation(data.email, data.name),
      contactSetting?.managingEmails?.length
        ? sendContactNotification(contactSetting.managingEmails, data, meta)
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 })
  }
}
