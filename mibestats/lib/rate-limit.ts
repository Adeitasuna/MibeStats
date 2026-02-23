/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: In serverless environments, module-level state is not shared across
 * concurrent function instances. For high-traffic production deployments,
 * replace with an Upstash Redis-backed implementation
 * (@upstash/ratelimit + @upstash/redis). For Vercel Hobby tier at this
 * traffic level, in-memory is acceptable.
 */

type Window = { requests: number[] }

// Module-level store: persists for the lifetime of a warm function instance.
const store = new Map<string, Window>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetMs: number   // Unix ms when the oldest request leaves the window
}

/**
 * Check and record a request for the given key (typically a client IP).
 *
 * @param key        Rate-limit key (e.g. IP address)
 * @param limit      Max requests allowed within the window
 * @param windowSecs Sliding window length in seconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): RateLimitResult {
  const now    = Date.now()
  const window = windowSecs * 1000
  const state  = store.get(key) ?? { requests: [] }

  // Prune timestamps that have fallen outside the current window
  state.requests = state.requests.filter((t) => t > now - window)

  if (state.requests.length >= limit) {
    const resetMs = state.requests[0] + window
    store.set(key, state)
    return { success: false, remaining: 0, resetMs }
  }

  state.requests.push(now)
  store.set(key, state)

  return {
    success:   true,
    remaining: limit - state.requests.length,
    resetMs:   now + window,
  }
}

/**
 * Extract the client IP from a Request.
 * Reads x-forwarded-for (set by Vercel / reverse proxies) with fallback.
 */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
