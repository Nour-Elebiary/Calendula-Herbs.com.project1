import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

/** Hash a plain text password/OTP with bcrypt */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

/** Compare a plain text value against a stored bcrypt hash */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * Validate password strength.
 * Rules: min 8 chars, uppercase, lowercase, digit, special char.
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) errors.push('At least 8 characters required')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter required')
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter required')
  if (!/\d/.test(password)) errors.push('At least one number required')
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push('At least one special character required')

  return { valid: errors.length === 0, errors }
}

/**
 * Generate a cryptographically secure random OTP (6 digits).
 * Uses Web Crypto API — works in both Node.js and Edge runtimes.
 */
export function generateOtpCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const code = (array[0] % 1_000_000).toString().padStart(6, '0')
  return code
}

/**
 * Get OTP expiry timestamp (default: 10 minutes from now)
 */
export function getOtpExpiry(minutesFromNow = 10): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000)
}

/**
 * Extract client IP from request headers.
 * Handles Vercel's x-forwarded-for, Cloudflare CF-Connecting-IP, etc.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

/**
 * Extract User-Agent from request headers.
 */
export function getUserAgent(headers: Headers): string {
  return headers.get('user-agent') || 'unknown'
}
