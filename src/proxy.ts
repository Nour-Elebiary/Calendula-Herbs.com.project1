import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip non-admin, non-API routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Admin/API routes → check auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token?.email

  if (pathname.startsWith('/api/admin') && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (pathname.startsWith('/admin')) {
    const isAuthPage =
      pathname === '/admin/login' ||
      pathname.startsWith('/admin/forgot-password') ||
      pathname.startsWith('/admin/otp') ||
      pathname === '/admin/email-changed'

    if (!isAuthPage && !isLoggedIn) {
      const loginUrl = new URL('/admin/login', req.nextUrl.origin)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAuthPage && isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl.origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|static|favicon.ico|.*\\..*).*)',
  ],
}
