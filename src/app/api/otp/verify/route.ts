import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OtpType } from '@prisma/client'
import { verifyOtp } from '@/lib/otp'
import { otpVerifyRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/security'

const schema = z.object({
  identifier: z.string().email(),
  type: z.enum(['EMAIL_RESET', 'PHONE_RESET', 'EMAIL_VERIFY']),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const { success } = await otpVerifyRateLimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before trying again.' },
        { status: 429 },
      )
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { identifier, type, code } = parsed.data
    const result = await verifyOtp(identifier, type as OtpType, code)

    if (!result.success) {
      const messages = {
        expired: 'Code has expired. Please request a new one.',
        not_found: 'No active code found. Please request a new one.',
        invalid: 'Incorrect code. Please try again.',
        max_attempts: 'Too many failed attempts. Please request a new code.',
      }
      return NextResponse.json(
        { error: messages[result.reason] },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[OTP VERIFY]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
