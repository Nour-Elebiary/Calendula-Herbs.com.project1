import type { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/public/cart/route'

const mockCreate = vi.fn()
const mockFindUnique = vi.fn()
const mockLimit = vi.fn()
const mockSendConfirmation = vi.fn()
const mockSendNotification = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    cartInquiry: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    contactSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  cartRateLimit: {
    limit: (...args: unknown[]) => mockLimit(...args),
  },
}))

vi.mock('@/lib/email', () => ({
  sendCartConfirmation: (...args: unknown[]) => mockSendConfirmation(...args),
  sendCartNotification: (...args: unknown[]) => mockSendNotification(...args),
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

describe('POST /api/public/cart', () => {
  it('accepts valid cart items', async () => {
    const res = await POST(createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      items: [
        { productId: 'p1', productName: 'Chamomile', quantity: 2 },
      ]
    }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ success: true })
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockLimit).toHaveBeenCalledWith('127.0.0.1')
  })

  it('rejects empty cart', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      items: []
    }))
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects invalid quantity', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      items: [
        { productId: 'p1', productName: 'Chamomile', quantity: 0 },
      ]
    }))
    expect(res.status).toBe(400)
  })

  it('sanitises XSS attempts in input fields', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      items: [
        { productId: 'p1', productName: 'Chamomile<script>alert(1)</script>', quantity: 2 },
      ]
    }))

    expect(res.status).toBe(200)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          itemsJson: expect.stringContaining('Chamomile'),
        }),
      })
    )
    // ensure no <script>
    const callArgs = mockCreate.mock.calls[0][0]
    expect(callArgs.data.itemsJson).not.toContain('<script>')
  })

  it('rejects when rate limited', async () => {
    mockLimit.mockResolvedValue({ success: false })
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      items: [
        { productId: 'p1', productName: 'Chamomile', quantity: 2 },
      ]
    }))
    expect(res.status).toBe(429)
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
