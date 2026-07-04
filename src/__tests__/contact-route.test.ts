import type { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/public/contact/route'

const mockCreate = vi.fn()
const mockFindUnique = vi.fn()
const mockLimit = vi.fn()
const mockSendConfirmation = vi.fn()
const mockSendNotification = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    contactSubmission: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    contactSetting: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  contactRateLimit: {
    limit: (...args: unknown[]) => mockLimit(...args),
  },
}))

vi.mock('@/lib/email', () => ({
  sendContactConfirmation: (...args: unknown[]) => mockSendConfirmation(...args),
  sendContactNotification: (...args: unknown[]) => mockSendNotification(...args),
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

describe('POST /api/public/contact', () => {
  it('accepts a valid contact submission', async () => {
    const res = await POST(createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'I am interested in your chamomile products.',
    }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ success: true })
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockLimit).toHaveBeenCalledWith('127.0.0.1')
  })

  it('treats optional fields as valid', async () => {
    const res = await POST(createRequest({
      name: 'John',
      email: 'john@test.com',
      phone: '+1-555-1234',
      company: 'Herbs Inc.',
      country: 'US',
      subject: 'Bulk Order',
      message: 'Need 1000kg of calendula.',
    }))

    expect(res.status).toBe(200)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'John',
          company: 'Herbs Inc.',
          subject: 'Bulk Order',
        }),
      }),
    )
  })

  it('rejects missing name', async () => {
    const res = await POST(createRequest({
      email: 'jane@example.com',
      message: 'Hello',
    }))

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects missing email', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      message: 'Hello',
    }))

    expect(res.status).toBe(400)
  })

  it('rejects invalid email format', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'not-an-email',
      message: 'Hello',
    }))

    expect(res.status).toBe(400)
  })

  it('rejects missing message', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
    }))

    expect(res.status).toBe(400)
  })

  it('rejects message exceeding 5000 characters', async () => {
    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'x'.repeat(5001),
    }))

    expect(res.status).toBe(400)
  })

  it('rejects when rate limited', async () => {
    mockLimit.mockResolvedValue({ success: false })

    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello',
    }))

    expect(res.status).toBe(429)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('handles DB failure gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('DB connection failed'))

    const res = await POST(createRequest({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello',
    }))

    expect(res.status).toBe(500)
  })
})
