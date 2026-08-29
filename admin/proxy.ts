import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

function authApiIsCrossOrigin(request: NextRequest): boolean {
  const authUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  if (!authUrl) {
    return false
  }
  try {
    return new URL(authUrl).hostname !== request.nextUrl.hostname
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  // Session cookies are set on the Nest API host. When the admin app is on
  // another site (Netlify vs Render), this request never carries that cookie,
  // so an optimistic check would bounce every successful login back to /login.
  // AuthGuard still validates the session client-side (cookie or bearer).
  if (authApiIsCrossOrigin(request)) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(request)

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
