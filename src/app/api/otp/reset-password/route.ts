import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OtpType } from '@prisma/client'
import { verifyOtp } from '@/lib/otp'
import { getClientIp, validatePasswordStrength, hashPassword } from '@/lib/security'
import { db } from '@/lib/db'
import { otpVerifyRateLimit } from '@/lib/rate-limit'

const schema = z.object({
  identifier: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
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

    const { identifier, code, newPassword } = parsed.data

    // Validate password strength
    const strength = validatePasswordStrength(newPassword)
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.errors.join('. ') },
        { status: 400 },
      )
    }

    // Verify and consume OTP
    const result = await verifyOtp(identifier, 'EMAIL_RESET' as OtpType, code, true)

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

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Find the admin to update
    const admin = await db.admin.findFirst({
      where: {
        OR: [
          { email: identifier },
          { recoveryEmails: { has: identifier } },
        ],
      },
    })

    if (!admin) {
      // Return success anyway for security, even though the OTP verify would have failed if the identifier wasn't used to create an OTP.
      return NextResponse.json({ success: true })
    }

    // Update password and revoke all active sessions
    await db.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newPasswordHash,
        lockedUntil: null,
        failedAttempts: 0,
      },
    })

    await db.adminSession.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[OTP RESET PASSWORD]', err)
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 })
  }
}
