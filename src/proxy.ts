import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  // Check for valid user (session with empty user means revoked JWT)
  const isLoggedIn = !!session?.user?.email

  // Protected admin routes (everything under /admin except /admin/login and /admin/forgot-password)
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAuthPage =
    nextUrl.pathname === '/admin/login' ||
    nextUrl.pathname.startsWith('/admin/forgot-password') ||
    nextUrl.pathname.startsWith('/admin/otp') ||
    nextUrl.pathname === '/admin/email-changed'

  // Protected admin API routes
  const isAdminApi = nextUrl.pathname.startsWith('/api/admin')

  if (isAdminApi && !isLoggedIn) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    )
  }

  if (isAdminRoute && !isAuthPage && !isLoggedIn) {
    const loginUrl = new URL('/admin/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect already-authenticated admins away from login page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all admin routes and admin API routes
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
