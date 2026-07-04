import { describe, it, expect } from 'vitest'
import {
  validatePasswordStrength,
  generateOtpCode,
  getOtpExpiry,
  getClientIp,
  getUserAgent,
} from '@/lib/security'

describe('validatePasswordStrength', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePasswordStrength('Ab1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('At least 8 characters required')
  })

  it('rejects passwords without uppercase letter', () => {
    const result = validatePasswordStrength('abcdef1!@')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('At least one uppercase letter required')
  })

  it('rejects passwords without lowercase letter', () => {
    const result = validatePasswordStrength('ABCDEF1!@')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('At least one lowercase letter required')
  })

  it('rejects passwords without a digit', () => {
    const result = validatePasswordStrength('Abcdefg!@')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('At least one number required')
  })

  it('rejects passwords without a special character', () => {
    const result = validatePasswordStrength('Abcdefg1')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('At least one special character required')
  })

  it('accepts a strong password', () => {
    const result = validatePasswordStrength('Str0ng!Pass')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns multiple errors for a weak password', () => {
    const result = validatePasswordStrength('weak')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })
})

describe('generateOtpCode', () => {
  it('returns a 6-digit string', () => {
    const code = generateOtpCode()
    expect(code).toMatch(/^\d{6}$/)
  })

  it('includes leading zeros for small values', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateOtpCode()
      expect(code.length).toBe(6)
    }
  })

  it('produces different codes across calls', () => {
    const codes = new Set(Array.from({ length: 10 }, () => generateOtpCode()))
    expect(codes.size).toBeGreaterThan(1)
  })
})

describe('getOtpExpiry', () => {
  it('returns a date in the future', () => {
    const before = Date.now()
    const expiry = getOtpExpiry()
    expect(expiry.getTime()).toBeGreaterThan(before)
  })

  it('uses 10 minutes as default', () => {
    const now = Date.now()
    const expiry = getOtpExpiry()
    const diffMs = expiry.getTime() - now
    expect(diffMs).toBeGreaterThan(9.5 * 60 * 1000)
    expect(diffMs).toBeLessThan(10.5 * 60 * 1000)
  })

  it('accepts custom minutes from now', () => {
    const now = Date.now()
    const expiry = getOtpExpiry(5)
    const diffMs = expiry.getTime() - now
    expect(diffMs).toBeGreaterThan(4.5 * 60 * 1000)
    expect(diffMs).toBeLessThan(5.5 * 60 * 1000)
  })
})

describe('getClientIp', () => {
  function mockHeaders(entries: Record<string, string>): Headers {
    const h = new Headers()
    for (const [k, v] of Object.entries(entries)) {
      h.set(k, v)
    }
    return h
  }

  it('reads cf-connecting-ip first', () => {
    const ip = getClientIp(mockHeaders({
      'cf-connecting-ip': '1.2.3.4',
      'x-forwarded-for': '5.6.7.8',
    }))
    expect(ip).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const ip = getClientIp(mockHeaders({
      'x-real-ip': '2.2.2.2',
    }))
    expect(ip).toBe('2.2.2.2')
  })

  it('falls back to x-forwarded-for', () => {
    const ip = getClientIp(mockHeaders({
      'x-forwarded-for': '3.3.3.3, 4.4.4.4',
    }))
    expect(ip).toBe('3.3.3.3')
  })

  it('returns unknown when no header present', () => {
    const ip = getClientIp(new Headers())
    expect(ip).toBe('unknown')
  })
})

describe('getUserAgent', () => {
  it('returns the user-agent header value', () => {
    const ua = getUserAgent(new Headers({ 'user-agent': 'Mozilla/5.0' }))
    expect(ua).toBe('Mozilla/5.0')
  })

  it('returns unknown when header is missing', () => {
    const ua = getUserAgent(new Headers())
    expect(ua).toBe('unknown')
  })
})
