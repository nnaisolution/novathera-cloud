import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  // Runs before routes render. Optimistic cookie check only — AuthGuard still validates the session client-side.
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    const pathname = request.nextUrl.pathname
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/employees/:path*',
    '/services/:path*',
    '/locations/:path*',
    '/bookings/:path*',
    '/health/:path*',
    '/customers/:path*',
    '/payments/:path*',
    '/brands/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/discounts/:path*',
    '/shipping/:path*',
    '/documents/:path*',
  ],
}
