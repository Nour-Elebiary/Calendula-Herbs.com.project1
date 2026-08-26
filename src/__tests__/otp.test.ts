import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOtp, verifyOtp, getOtpRemainingSeconds } from '@/lib/otp'
import { db } from '@/lib/db'
import { generateOtpCode, hashPassword, verifyPassword } from '@/lib/security'

vi.mock('@/lib/db', () => ({
  db: {
    otpCode: {
      updateMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    }
  }
}))

vi.mock('@/lib/security', () => ({
  generateOtpCode: vi.fn(() => '123456'),
  getOtpExpiry: vi.fn(() => new Date(Date.now() + 10 * 60 * 1000)),
  hashPassword: vi.fn(() => 'hashed123456'),
  verifyPassword: vi.fn(),
}))

describe('otp module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  describe('createOtp', () => {
    it('creates an OTP code', async () => {
      const code = await createOtp('user@example.com', 'EMAIL_RESET')
      expect(code).toBe('123456')
      expect(db.otpCode.updateMany).toHaveBeenCalled()
      expect(db.otpCode.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          identifier: 'user@example.com',
          type: 'EMAIL_RESET',
          codeHash: 'hashed123456'
        })
      }))
    })
  })

  describe('verifyOtp', () => {
    it('returns not_found if no otp', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue(null)
      const res = await verifyOtp('user', 'EMAIL_RESET', '123')
      expect(res).toEqual({ success: false, reason: 'not_found' })
    })

    it('returns expired if expired', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue({
        id: '1', expiresAt: new Date(Date.now() - 1000), attempts: 0
      } as any)
      const res = await verifyOtp('user', 'EMAIL_RESET', '123')
      expect(res).toEqual({ success: false, reason: 'expired' })
    })

    it('returns max_attempts if too many attempts', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue({
        id: '1', expiresAt: new Date(Date.now() + 1000), attempts: 3
      } as any)
      const res = await verifyOtp('user', 'EMAIL_RESET', '123')
      expect(res).toEqual({ success: false, reason: 'max_attempts' })
    })

    it('verifies successfully and marks as used', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue({
        id: '1', expiresAt: new Date(Date.now() + 1000), attempts: 0, codeHash: 'hash'
      } as any)
      vi.mocked(verifyPassword).mockResolvedValue(true)
      
      const res = await verifyOtp('user', 'EMAIL_RESET', '123')
      expect(res).toEqual({ success: true })
      expect(db.otpCode.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: { usedAt: expect.any(Date) }
      }))
    })

    it('handles invalid password and increments attempts', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue({
        id: '1', expiresAt: new Date(Date.now() + 1000), attempts: 1, codeHash: 'hash'
      } as any)
      vi.mocked(verifyPassword).mockResolvedValue(false)
      
      const res = await verifyOtp('user', 'EMAIL_RESET', '123')
      expect(res).toEqual({ success: false, reason: 'invalid' })
      expect(db.otpCode.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: { attempts: { increment: 1 } }
      }))
    })

    it('expires otp if max attempts reached on current failure', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue({
        id: '1', expiresAt: new Date(Date.now() + 1000), attempts: 2, codeHash: 'hash'
      } as any)
      vi.mocked(verifyPassword).mockResolvedValue(false)
      
      const res = await verifyOtp('user', 'EMAIL_RESET', '123')
      expect(res).toEqual({ success: false, reason: 'max_attempts' })
      // Called twice: once to increment, once to expire
      expect(db.otpCode.update).toHaveBeenCalledTimes(2)
    })
  })

  describe('getOtpRemainingSeconds', () => {
    it('returns remaining seconds correctly', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue({
        expiresAt: new Date(Date.now() + 120000) // 2 minutes
      } as any)
      expect(await getOtpRemainingSeconds('user', 'EMAIL_RESET')).toBe(120)
    })

    it('returns 0 if not found', async () => {
      vi.mocked(db.otpCode.findFirst).mockResolvedValue(null)
      expect(await getOtpRemainingSeconds('user', 'EMAIL_RESET')).toBe(0)
    })
  })
})
