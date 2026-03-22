/**
 * Unit tests for lib/analytics.ts
 *
 * Tests:
 *   - trackPageView sends correct payload to Umami
 *   - trackEvent sends event with data
 *   - No-ops gracefully when not configured
 *   - Handles fetch failures without throwing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Save originals
const origEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
})

afterEach(() => {
  process.env = { ...origEnv }
  vi.restoreAllMocks()
})

describe('analytics (not configured)', () => {
  it('does not call fetch when UMAMI_HOST is unset', async () => {
    delete process.env.UMAMI_HOST
    delete process.env.UMAMI_WEBSITE_ID
    const { trackPageView } = await import('../lib/analytics')

    trackPageView('/test')
    // Give fire-and-forget promise time to resolve
    await new Promise((r) => setTimeout(r, 50))

    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('analytics (configured)', () => {
  beforeEach(() => {
    process.env.UMAMI_HOST = 'https://analytics.test'
    process.env.UMAMI_WEBSITE_ID = 'test-site-id'
  })

  it('trackPageView sends correct payload', async () => {
    const { trackPageView } = await import('../lib/analytics')

    trackPageView('/dashboard', 'https://google.com', 'en-US')
    await new Promise((r) => setTimeout(r, 50))

    expect(fetch).toHaveBeenCalledWith(
      'https://analytics.test/api/send',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('/dashboard'),
      }),
    )

    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.payload.website).toBe('test-site-id')
    expect(body.payload.url).toBe('/dashboard')
    expect(body.payload.referrer).toBe('https://google.com')
    expect(body.type).toBe('event')
  })

  it('trackEvent sends named event with data', async () => {
    const { trackEvent } = await import('../lib/analytics')

    trackEvent('/traits', 'filter_applied', { archetype: 'Milady' })
    await new Promise((r) => setTimeout(r, 50))

    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(body.payload.name).toBe('filter_applied')
    expect(body.payload.data).toEqual({ archetype: 'Milady' })
  })

  it('handles fetch failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const { trackPageView } = await import('../lib/analytics')

    // Should not throw
    trackPageView('/test')
    await new Promise((r) => setTimeout(r, 50))
  })
})
