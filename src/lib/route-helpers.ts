/**
 * Route handler utilities — higher-order functions to eliminate boilerplate
 * from admin API routes.
 *
 * Usage:
 *   export const GET = withAdminAuth(async (req, ctx, adminId) => { ... })
 *   export const POST = withAdminAuth(withValidation(schema, async (req, ctx, adminId, data) => { ... }))
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export type RouteContext = { params: Promise<Record<string, string>> }

// ─── withAdminAuth ────────────────────────────────────────────────────────────

type AdminHandler = (
  req: NextRequest,
  ctx: RouteContext,
  adminId: string,
) => Promise<NextResponse>

/**
 * Wraps an admin route handler with authentication.
 * Returns 401 if the session is missing or invalid.
 */
export function withAdminAuth(handler: AdminHandler) {
  return async (req: NextRequest, ctx: RouteContext): Promise<NextResponse> => {
    let adminId: string
    try {
      adminId = await requireAdmin()
    } catch {
      return unauthorized()
    }
    return handler(req, ctx, adminId)
  }
}

// ─── withValidation ──────────────────────────────────────────────────────────

type ValidatedHandler<T> = (
  req: NextRequest,
  ctx: RouteContext,
  adminId: string,
  data: T,
) => Promise<NextResponse>

/**
 * Wraps an admin handler with Zod validation of the JSON body.
 * Returns 400 with Zod issues on validation failure.
 * Returns 400 on invalid JSON.
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: ValidatedHandler<T>,
): AdminHandler {
  return async (req: NextRequest, ctx: RouteContext, adminId: string) => {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 })
    }

    return handler(req, ctx, adminId, result.data)
  }
}

// ─── apiError ────────────────────────────────────────────────────────────────

/**
 * Consistent error response helper.
 * Logs the error server-side and returns a sanitised JSON response.
 */
export function apiError(
  message: string,
  status = 500,
  err?: unknown,
): NextResponse {
  if (err) {
    console.error(`[API] ${message}`, err)
  }
  return NextResponse.json({ error: message }, { status })
}
