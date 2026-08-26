import { describe, it, expect, vi } from 'vitest'
import { requireAdmin, unauthorized, AuthError } from '@/lib/admin-auth'
import { auth } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

describe('admin-auth module', () => {
  describe('requireAdmin', () => {
    it('returns admin id if session exists', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'admin123' } } as any)
      const id = await requireAdmin()
      expect(id).toBe('admin123')
    })

    it('throws AuthError if no session or user id', async () => {
      vi.mocked(auth).mockResolvedValue(null as any)
      await expect(requireAdmin()).rejects.toThrow(AuthError)

      vi.mocked(auth).mockResolvedValue({ user: {} } as any)
      await expect(requireAdmin()).rejects.toThrow(AuthError)
    })
  })

  describe('unauthorized', () => {
    it('returns a 401 response', () => {
      const res = unauthorized()
      expect(res.status).toBe(401)
    })
  })
})
