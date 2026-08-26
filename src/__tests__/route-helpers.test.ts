import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock next-auth / admin-auth so we can control auth outcomes
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn(),
  unauthorized: vi.fn(() => NextResponse.json({ error: 'Unauthorized' }, { status: 401 })),
}))

import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'
import { requireAdmin } from '@/lib/admin-auth'

const FAKE_CTX = { params: Promise.resolve({}) }

function makeRequest(body?: unknown, method = 'GET'): NextRequest {
  const req = new NextRequest('http://localhost/api/test', {
    method,
    ...(body !== undefined && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  })
  return req
}

// ─── withAdminAuth ────────────────────────────────────────────────────────────

describe('withAdminAuth', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls handler and passes adminId when auth succeeds', async () => {
    vi.mocked(requireAdmin).mockResolvedValue('user-123')
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withAdminAuth(handler)

    const res = await wrapped(makeRequest(), FAKE_CTX)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalledWith(expect.any(NextRequest), FAKE_CTX, 'user-123')
  })

  it('returns 401 when requireAdmin throws', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Unauthorized'))
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withAdminAuth(handler)

    const res = await wrapped(makeRequest(), FAKE_CTX)
    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })
})

// ─── withValidation ──────────────────────────────────────────────────────────

describe('withValidation', () => {
  const schema = z.object({ name: z.string().min(1), value: z.number() })

  beforeEach(() => vi.clearAllMocks())

  it('calls handler with parsed data on valid body', async () => {
    vi.mocked(requireAdmin).mockResolvedValue('user-abc')
    const handler = vi.fn(async (_req, _ctx, _id, data) => NextResponse.json(data))
    const wrapped = withAdminAuth(withValidation(schema, handler))

    const res = await wrapped(makeRequest({ name: 'test', value: 42 }, 'POST'), FAKE_CTX)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalledWith(
      expect.any(NextRequest), FAKE_CTX, 'user-abc', { name: 'test', value: 42 }
    )
  })

  it('returns 400 when body fails Zod validation', async () => {
    vi.mocked(requireAdmin).mockResolvedValue('user-abc')
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withAdminAuth(withValidation(schema, handler))

    const res = await wrapped(makeRequest({ name: '', value: 'not-a-number' }, 'POST'), FAKE_CTX)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  it('returns 400 on invalid JSON body', async () => {
    vi.mocked(requireAdmin).mockResolvedValue('user-abc')
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withAdminAuth(withValidation(schema, handler))

    // Craft a request with malformed JSON
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: 'not json at all{{{',
      headers: { 'Content-Type': 'application/json' },
    })

    const res = await wrapped(req, FAKE_CTX)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid JSON body')
  })
})

// ─── apiError ────────────────────────────────────────────────────────────────

describe('apiError', () => {
  it('returns correct status and error message', async () => {
    const res = apiError('Something broke', 503)
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBe('Something broke')
  })

  it('defaults to 500', async () => {
    const res = apiError('Internal error')
    expect(res.status).toBe(500)
  })

  it('logs the error when err is provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('db connection failed')
    apiError('DB error', 500, err)
    expect(consoleSpy).toHaveBeenCalledWith('[API] DB error', err)
    consoleSpy.mockRestore()
  })
})
