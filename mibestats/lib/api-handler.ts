import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

interface Options {
  /** If set, adds Cache-Control + CDN-Cache-Control headers to successful responses. */
  cacheSecs?: number
}

/**
 * Wraps an API route handler with rate limiting, caching, and error handling.
 */
export function withRateLimit(
  key: string,
  limit: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options?: Options,
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
      const res = await handler(req, ...rest)
      if (options?.cacheSecs && res.ok) {
        const swr = Math.floor(options.cacheSecs / 2)
        res.headers.set('Cache-Control', `public, s-maxage=${options.cacheSecs}, stale-while-revalidate=${swr}`)
        res.headers.set('CDN-Cache-Control', `public, s-maxage=${options.cacheSecs}, stale-while-revalidate=${swr}`)
      }
      return res
    } catch (err) {
      console.error(`[/api/${key}]`, err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
