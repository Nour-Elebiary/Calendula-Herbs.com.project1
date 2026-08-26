import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      constructor() {
        // Mock properties can be verified
        (this as any).isMocked = true
      }
    }
  }
})

describe('db module', () => {
  beforeEach(() => {
    vi.resetModules()
    const globalObj = global as any
    if (globalObj.prisma) {
      delete globalObj.prisma
    }
  })

  it('Returns Prisma singleton', async () => {
    const { db } = await import('@/lib/db')
    expect(db).toBeDefined()
    expect((db as any).isMocked).toBe(true)
  })

  it('Same instance on repeated calls', async () => {
    const { db: db1 } = await import('@/lib/db')
    const { db: db2 } = await import('@/lib/db')
    expect(db1).toBe(db2)
  })
})
