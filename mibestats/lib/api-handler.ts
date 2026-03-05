import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * Wraps an API route handler with rate limiting and error handling.
 *
 * Eliminates the repeated boilerplate across all API routes:
 * - IP-based rate limiting with configurable key + limit
 * - 429 response with Retry-After header
 * - try/catch with console.error + generic 500 response
 */
export function withRateLimit(
  key: string,
  limit: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, ...rest: any[]): Promise<NextResponse> => {
    const ip = getClientIp(req)
    const rl = checkRateLimit(`${key}:${ip}`, limit, 60)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
      )
    }

    try {
      return await handler(req, ...rest)
    } catch (err) {
      console.error(`[/api/${key}]`, err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
