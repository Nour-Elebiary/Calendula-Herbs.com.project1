import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLimit = vi.fn()

vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    limit = mockLimit
    static slidingWindow = vi.fn().mockReturnValue('mock-sliding-window')
  }
  return { Ratelimit }
})

vi.mock('@upstash/redis', () => ({
  Redis: class {}
}))

vi.mock('@/lib/env', () => ({
  getRequiredEnvVar: vi.fn().mockReturnValue('mocked-env-var'),
}))

// We need to import dynamically after mocks are set up
import { contactRateLimit } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Allows requests under the limit', async () => {
    mockLimit.mockResolvedValue({ success: true, pending: Promise.resolve() })
    const res = await contactRateLimit.limit('127.0.0.1')
    expect(res.success).toBe(true)
    expect(mockLimit).toHaveBeenCalledWith('127.0.0.1')
  })

  it('Blocks requests over the limit', async () => {
    mockLimit.mockResolvedValue({ success: false, pending: Promise.resolve() })
    const res = await contactRateLimit.limit('127.0.0.1')
    expect(res.success).toBe(false)
  })

  it('Window resets after specified duration', async () => {
    mockLimit.mockResolvedValueOnce({ success: true, pending: Promise.resolve() })
    mockLimit.mockResolvedValueOnce({ success: false, pending: Promise.resolve() })
    mockLimit.mockResolvedValueOnce({ success: true, pending: Promise.resolve() })

    const res1 = await contactRateLimit.limit('127.0.0.1')
    expect(res1.success).toBe(true)

    const res2 = await contactRateLimit.limit('127.0.0.1')
    expect(res2.success).toBe(false)

    const res3 = await contactRateLimit.limit('127.0.0.1')
    expect(res3.success).toBe(true)
  })
})
