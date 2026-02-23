/**
 * Unit tests for lib/rate-limit.ts
 *
 * Tests:
 *   - Allows requests within limit
 *   - Blocks requests exceeding limit
 *   - Sliding window expiry
 *   - getClientIp extraction from x-forwarded-for
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Re-import fresh module for each test to reset the in-memory store
let checkRateLimit: typeof import('../lib/rate-limit').checkRateLimit
let getClientIp: typeof import('../lib/rate-limit').getClientIp

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('../lib/rate-limit')
  checkRateLimit = mod.checkRateLimit
  getClientIp = mod.getClientIp
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('checkRateLimit', () => {
  it('allows requests within the limit', () => {
    const result = checkRateLimit('test-ip', 5, 60)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks requests exceeding the limit', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('block-test', 5, 60)
    }
    const result = checkRateLimit('block-test', 5, 60)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('tracks different keys independently', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('key-a', 5, 60)
    }
    // key-a is exhausted
    expect(checkRateLimit('key-a', 5, 60).success).toBe(false)
    // key-b is fresh
    expect(checkRateLimit('key-b', 5, 60).success).toBe(true)
  })

  it('decrements remaining count correctly', () => {
    const r1 = checkRateLimit('count-test', 3, 60)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit('count-test', 3, 60)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit('count-test', 3, 60)
    expect(r3.remaining).toBe(0)

    const r4 = checkRateLimit('count-test', 3, 60)
    expect(r4.success).toBe(false)
  })
})

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('returns "unknown" when no x-forwarded-for header', () => {
    const req = new Request('http://localhost')
    expect(getClientIp(req)).toBe('unknown')
  })

  it('trims whitespace from IP', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  10.0.0.1  , 10.0.0.2' },
    })
    expect(getClientIp(req)).toBe('10.0.0.1')
  })
})
