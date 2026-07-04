import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractSenderMeta } from '@/lib/sender-meta'

function mockRequest(headers: Record<string, string>) {
  const h = new Headers()
  for (const [k, v] of Object.entries(headers)) {
    h.set(k, v)
  }
  return { headers: h } as unknown as import('next/server').NextRequest
}

describe('extractSenderMeta', () => {
  it('extracts all available metadata from request', () => {
    const meta = extractSenderMeta(mockRequest({
      'x-forwarded-for': '1.2.3.4',
      'user-agent': 'Mozilla/5.0',
      'referer': 'https://example.com/',
      'accept-language': 'en-US',
    }))

    expect(meta.ip).toBe('1.2.3.4')
    expect(meta.userAgent).toBe('Mozilla/5.0')
    expect(meta.referer).toBe('https://example.com/')
    expect(meta.acceptLanguage).toBe('en-US')
    expect(meta.country).toBeNull()
  })

  it('falls back to unknown for missing headers', () => {
    const meta = extractSenderMeta(mockRequest({}))
    expect(meta.ip).toBe('unknown')
    expect(meta.userAgent).toBe('unknown')
    expect(meta.referer).toBeNull()
    expect(meta.acceptLanguage).toBeNull()
  })

  it('takes first IP from x-forwarded-for chain', () => {
    const meta = extractSenderMeta(mockRequest({
      'x-forwarded-for': '10.0.0.1, 192.168.1.1',
      'user-agent': 'curl/8.0',
    }))
    expect(meta.ip).toBe('10.0.0.1')
  })
})
