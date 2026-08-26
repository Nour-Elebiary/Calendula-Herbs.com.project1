import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/security'
import * as NextAuth from 'next-auth'

// Mock next-auth to just return the config object so we can test its callbacks
vi.mock('next-auth', () => {
  return {
    default: vi.fn((config) => ({
      handlers: {},
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: config, // Pass config out via auth export
    })),
  }
})

// Mock next-auth/providers/credentials
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => config)
}))

vi.mock('@/lib/db', () => ({
  db: {
    admin: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    adminSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    }
  }
}))

vi.mock('@/lib/security', () => ({
  verifyPassword: vi.fn()
}))

describe('auth module', () => {
  let authConfig: any;

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    
    // Dynamically import auth after mocks are set up
    const authModule = await import('@/lib/auth')
    authConfig = authModule.auth
  })

  describe('credentials authorize', () => {
    let authorize: any;
    
    beforeEach(() => {
      // Find the credentials provider and get its authorize function
      const credentialsProvider = authConfig.providers.find((p: any) => p.name === 'credentials')
      authorize = credentialsProvider.authorize
    })

    it('returns null on invalid input', async () => {
      const result = await authorize({ email: 'not-an-email', password: '' }, {})
      expect(result).toBeNull()
    })

    it('returns null if admin not found', async () => {
      vi.mocked(db.admin.findUnique).mockResolvedValue(null)
      const result = await authorize({ email: 'test@example.com', password: 'password' }, {})
      expect(result).toBeNull()
    })

    it('throws LOCKED if account is locked', async () => {
      vi.mocked(db.admin.findUnique).mockResolvedValue({
        lockedUntil: new Date(Date.now() + 10000)
      } as any)
      await expect(authorize({ email: 'test@example.com', password: 'password' }, {})).rejects.toThrow('LOCKED')
    })

    it('increments failed attempts and locks if too many on invalid password', async () => {
      vi.mocked(db.admin.findUnique).mockResolvedValue({
        id: '1', failedAttempts: 4
      } as any)
      vi.mocked(verifyPassword).mockResolvedValue(false)

      const result = await authorize({ email: 'test@example.com', password: 'password' }, {})
      expect(result).toBeNull()
      expect(db.admin.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          failedAttempts: 5,
          lockedUntil: expect.any(Date)
        })
      }))
    })

    it('returns admin object on success and creates session', async () => {
      vi.mocked(db.admin.findUnique).mockResolvedValue({
        id: '1', name: 'Admin', email: 'test@example.com', failedAttempts: 0
      } as any)
      vi.mocked(verifyPassword).mockResolvedValue(true)

      const req = new Request('http://localhost', {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.1', 'user-agent': 'vitest' })
      })

      const result = await authorize({ email: 'test@example.com', password: 'password' }, req)
      expect(result).toEqual(expect.objectContaining({
        id: '1', name: 'Admin', email: 'test@example.com', sessionId: expect.any(String)
      }))

      expect(db.admin.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          failedAttempts: 0,
          lockedUntil: null,
          lastLoginIp: '192.168.1.1',
          lastLoginUserAgent: 'vitest',
          lastLoginAt: expect.any(Date)
        })
      }))
      
      expect(db.adminSession.create).toHaveBeenCalled()
    })

    it('succeeds with country=Unknown when ip-api.com times out', async () => {
      vi.mocked(db.admin.findUnique).mockResolvedValue({
        id: '2', name: 'Admin', email: 'test@example.com', failedAttempts: 0
      } as any)
      vi.mocked(verifyPassword).mockResolvedValue(true)

      // Override the MSW handler so ip-api returns a network error
      const { mswServer } = await import('@/tests/../__tests__/setup')
      const { http, HttpResponse } = await import('msw')
      mswServer.use(
        http.get('https://ip-api.com/json/*', () => HttpResponse.error())
      )

      const req = new Request('http://localhost', {
        headers: new Headers({ 'x-forwarded-for': '1.2.3.4', 'user-agent': 'vitest' })
      })

      // Login should still succeed despite ip-api failure
      const result = await authorize({ email: 'test@example.com', password: 'password' }, req)
      expect(result).toMatchObject({ id: '2', sessionId: expect.any(String) })

      // Session should be created (country defaults to 'Unknown' in catch block)
      expect(db.adminSession.create).toHaveBeenCalled()
    })
  })

  describe('callbacks', () => {
    describe('jwt', () => {
      it('adds user properties to token', async () => {
        const token = await authConfig.callbacks.jwt({ token: {}, user: { id: '1', email: 'e', name: 'n', sessionId: 's' } })
        expect(token).toEqual(expect.objectContaining({ id: '1', email: 'e', name: 'n', sessionId: 's' }))
      })

      it('returns Revoked if session is revoked', async () => {
        vi.mocked(db.adminSession.findUnique).mockResolvedValue({ revokedAt: new Date() } as any)
        const token = await authConfig.callbacks.jwt({ token: { sessionId: 's' } })
        expect(token.error).toBe('Revoked')
      })
    })

    describe('session', () => {
      it('returns empty user if Revoked', async () => {
        const session = await authConfig.callbacks.session({ session: { user: { name: 'n' } }, token: { error: 'Revoked' } })
        expect(session.user).toEqual({})
      })

      it('maps token to session user', async () => {
        const session = await authConfig.callbacks.session({ session: { user: {} }, token: { id: '1', email: 'e', name: 'n' } })
        expect(session.user).toEqual(expect.objectContaining({ id: '1', email: 'e', name: 'n' }))
      })
    })
  })
})
