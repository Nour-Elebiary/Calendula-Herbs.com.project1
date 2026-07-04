import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OtpType } from '@prisma/client'
import { createOtp } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/email'
import { otpSendRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'
import { db } from '@/lib/db'

const schema = z.object({
  identifier: z.string().email('Valid email required'),
  type: z.enum(['EMAIL_RESET', 'PHONE_RESET', 'EMAIL_VERIFY']),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(req.headers)
    const { success } = await otpSendRateLimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before requesting another code.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { identifier, type } = parsed.data

    // For EMAIL_RESET: verify the email belongs to an admin
    if (type === 'EMAIL_RESET') {
      const admin = await db.admin.findFirst({
        where: {
          OR: [
            { email: identifier },
            { recoveryEmails: { has: identifier } },
          ],
        },
      })
      if (!admin) {
        // Return success anyway (security — don't reveal if email exists)
        return NextResponse.json({ success: true })
      }
    }

    const code = await createOtp(identifier, type as OtpType)
    const result = await sendOtpEmail(identifier, code)

    if (result.error) {
      console.error('Resend Error:', result.error)
      return NextResponse.json({ error: 'Failed to send OTP email: ' + result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[OTP SEND]', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
