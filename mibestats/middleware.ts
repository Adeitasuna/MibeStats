import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trackPageView } from '@/lib/analytics'

/**
 * Server-side analytics middleware.
 * Tracks page views via Umami on every navigation request.
 * Static assets, API routes, and Next.js internals are excluded.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, static files, Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const referrer = request.headers.get('referer') ?? undefined
  const language = request.headers.get('accept-language')?.split(',')[0] ?? undefined

  // Fire-and-forget — does not block the response
  trackPageView(pathname, referrer, language)

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
