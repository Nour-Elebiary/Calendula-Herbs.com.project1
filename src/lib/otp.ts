import { OtpType } from '@prisma/client'
import { db } from '@/lib/db'
import { generateOtpCode, getOtpExpiry, hashPassword, verifyPassword } from '@/lib/security'

const MAX_ATTEMPTS = 3
const OTP_EXPIRY_MINUTES = 10

/**
 * Generate a new OTP, invalidate any existing ones for this identifier+type,
 * and store the bcrypt hash in the DB.
 * Returns the plain-text code (to send via email/SMS).
 */
export async function createOtp(
  identifier: string,
  type: OtpType,
): Promise<string> {
  // Invalidate all existing unused OTPs for this identifier+type
  await db.otpCode.updateMany({
    where: {
      identifier,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() }, // expire them immediately
  })

  const code = generateOtpCode()
  const codeHash = await hashPassword(code)

  await db.otpCode.create({
    data: {
      identifier,
      type,
      codeHash,
      expiresAt: getOtpExpiry(OTP_EXPIRY_MINUTES),
    },
  })

  return code
}

export type OtpVerifyResult =
  | { success: true }
  | { success: false; reason: 'expired' | 'not_found' | 'invalid' | 'max_attempts' }

/**
 * Verify a submitted OTP code.
 * Increments attempt counter on failure.
 * Marks as used on success.
 */
export async function verifyOtp(
  identifier: string,
  type: OtpType,
  submittedCode: string,
  consume = true,
): Promise<OtpVerifyResult> {
  // Find the most recent valid OTP
  const otp = await db.otpCode.findFirst({
    where: {
      identifier,
      type,
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) {
    return { success: false, reason: 'not_found' }
  }

  if (otp.expiresAt < new Date()) {
    return { success: false, reason: 'expired' }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    return { success: false, reason: 'max_attempts' }
  }

  const valid = await verifyPassword(submittedCode, otp.codeHash)

  if (!valid) {
    // Increment attempts
    await db.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })

    // If this was the last attempt, mark it expired
    if (otp.attempts + 1 >= MAX_ATTEMPTS) {
      await db.otpCode.update({
        where: { id: otp.id },
        data: { expiresAt: new Date() },
      })
      return { success: false, reason: 'max_attempts' }
    }

    return { success: false, reason: 'invalid' }
  }

  // Mark as used if requested
  if (consume) {
    await db.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    })
  }

  return { success: true }
}

/** Get remaining seconds until OTP expires (for countdown UI) */
export async function getOtpRemainingSeconds(
  identifier: string,
  type: OtpType,
): Promise<number> {
  const otp = await db.otpCode.findFirst({
    where: { identifier, type, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) return 0
  return Math.max(0, Math.floor((otp.expiresAt.getTime() - Date.now()) / 1000))
}
