import type { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/public/sample/route'

const mockCreate = vi.fn()
const mockFindUnique = vi.fn()
const mockLimit = vi.fn()
const mockSendConfirmation = vi.fn()
const mockSendNotification = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    sampleRequest: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    contactSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  sampleRateLimit: {
    limit: (...args: unknown[]) => mockLimit(...args),
  },
}))

vi.mock('@/lib/email', () => ({
  sendSampleConfirmation: (...args: unknown[]) => mockSendConfirmation(...args),
  sendSampleNotification: (...args: unknown[]) => mockSendNotification(...args),
}))

vi.mock('@/lib/sender-meta', () => ({
  extractSenderMeta: () => ({
    ip: '127.0.0.1',
    userAgent: 'vitest',
    referer: null,
    acceptLanguage: null,
    country: null,
  }),
  enrichWithCountry: (meta: unknown) => Promise.resolve(meta),
}))

function createRequest(body: unknown, ip = '127.0.0.1') {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-forwarded-for': ip,
    'user-agent': 'vitest',
  })
  return {
    json: () => Promise.resolve(body),
    headers,
  } as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
  mockLimit.mockResolvedValue({ success: true })
  mockCreate.mockResolvedValue({ id: 'sub-1' })
  mockFindUnique.mockResolvedValue({
    managingEmails: ['admin@calendula-herbs.com'],
  })
})

describe('POST /api/public/sample', () => {
  it('accepts a valid sample request', async () => {
    const res = await POST(createRequest({
      productName: 'Chamomile Seeds',
      name: 'Jane Doe',
      email: 'jane@example.com',
      shippingBy: 'buyer',
    }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ success: true })
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockLimit).toHaveBeenCalledWith('127.0.0.1')
  })

  it('rejects missing productName', async () => {
    const res = await POST(createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      shippingBy: 'buyer',
    }))
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects invalid email format', async () => {
    const res = await POST(createRequest({
      productName: 'Seeds',
      name: 'Jane Doe',
      email: 'invalid',
      shippingBy: 'buyer',
    }))
    expect(res.status).toBe(400)
  })

  it('rejects when rate limited', async () => {
    mockLimit.mockResolvedValue({ success: false })
    const res = await POST(createRequest({
      productName: 'Seeds',
      name: 'Jane',
      email: 'jane@example.com',
      shippingBy: 'buyer',
    }))
    expect(res.status).toBe(429)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('sanitises XSS attempts in input fields', async () => {
    const res = await POST(createRequest({
      productName: '<script>alert("hack")</script>Seeds',
      name: 'Jane',
      email: 'jane@example.com',
      shippingBy: 'buyer',
    }))

    expect(res.status).toBe(200)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productName: 'Seeds', 
        }),
      })
    )
  })
})
