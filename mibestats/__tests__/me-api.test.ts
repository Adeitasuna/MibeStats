/**
 * Unit tests for lib/me-api.ts
 *
 * Tests:
 *   - Retry logic: 3-attempt exponential backoff on 429 / 5xx
 *   - MEApiError thrown after max retries exhausted
 *   - getCollectionStats() response parsing
 *   - getSalesPage() pagination cursor forwarding
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCollectionStats, getSalesPage, MEApiError } from '../lib/me-api'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ME_STATS_FIXTURE = {
  collections: [
    {
      floorAsk: { price: { amount: { native: 4.2 } } },
      volume: { '1day': 180.5, '7day': 1200.0, '30day': 4800.0, allTime: 92000.0 },
      salesCount: 3410,
      ownerCount: 2180,
    },
  ],
}

const ME_SALES_FIXTURE = {
  sales: [
    {
      token:     { tokenId: '42' },
      price:     { amount: { native: 5.5 } },
      timestamp: '2026-02-20T10:00:00Z',
      buyer:     '0xabc',
      seller:    '0xdef',
      txHash:    '0x123',
    },
    {
      token:     { tokenId: '777' },
      price:     { amount: { native: 12.0 } },
      timestamp: '2026-02-20T09:00:00Z',
      buyer:     '0xfoo',
      seller:    '0xbar',
      txHash:    '0x456',
    },
  ],
  continuation: 'cursor_abc123',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  process.env.ME_BEARER_TOKEN = 'test-token'
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  delete process.env.ME_BEARER_TOKEN
})

// ─── Retry logic ──────────────────────────────────────────────────────────────

describe('retry logic', () => {
  it('retries on 429 twice and succeeds on 3rd attempt', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      if (callCount < 3) return mockResponse(429, { message: 'Rate limited' })
      return mockResponse(200, ME_STATS_FIXTURE)
    })

    const promise = getCollectionStats()
    await vi.runAllTimersAsync()
    const result = await promise

    expect(callCount).toBe(3)
    expect(result.floorPrice).toBe(4.2)
  })

  it('retries on 500 and succeeds on 2nd attempt', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      if (callCount === 1) return mockResponse(500, { message: 'Server error' })
      return mockResponse(200, ME_STATS_FIXTURE)
    })

    const promise = getCollectionStats()
    await vi.runAllTimersAsync()
    const result = await promise

    expect(callCount).toBe(2)
    expect(result.totalSales).toBe(3410)
  })

  it('throws MEApiError after 3 consecutive 429 responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(429, { message: 'Rate limited' }),
    )

    const promise = getCollectionStats()
    await vi.runAllTimersAsync()

    await expect(promise).rejects.toBeInstanceOf(MEApiError)
  })

  it('sets status and endpoint on MEApiError', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(429, { message: 'Rate limited' }),
    )

    const promise = getCollectionStats()
    await vi.runAllTimersAsync()

    const err: MEApiError = await promise.catch((e) => e)
    expect(err.status).toBe(429)
    expect(err.endpoint).toContain('/collections/v7')
  })

  it('does NOT retry on 404 — throws immediately', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      return mockResponse(404, { message: 'Not found' })
    })

    await expect(getCollectionStats()).rejects.toBeInstanceOf(MEApiError)
    expect(callCount).toBe(1)
  })

  it('throws if ME_BEARER_TOKEN is not set', async () => {
    delete process.env.ME_BEARER_TOKEN

    await expect(getCollectionStats()).rejects.toThrow('ME_BEARER_TOKEN is not set')
  })
})

// ─── getCollectionStats() — response parsing ──────────────────────────────────

describe('getCollectionStats()', () => {
  it('parses nested collections[0] response shape', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse(200, ME_STATS_FIXTURE))

    const stats = await getCollectionStats()

    expect(stats.floorPrice).toBe(4.2)
    expect(stats.volume24h).toBe(180.5)
    expect(stats.volume7d).toBe(1200.0)
    expect(stats.volume30d).toBe(4800.0)
    expect(stats.volumeAllTime).toBe(92000.0)
    expect(stats.totalSales).toBe(3410)
    expect(stats.totalHolders).toBe(2180)
  })

  it('returns null for missing / undefined fields', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(200, { collections: [{}] }),
    )

    const stats = await getCollectionStats()

    expect(stats.floorPrice).toBeNull()
    expect(stats.volume24h).toBeNull()
    expect(stats.totalSales).toBeNull()
    expect(stats.totalHolders).toBeNull()
  })

  it('handles flat response shape (no collections wrapper)', async () => {
    const flat = {
      floorPrice: 3.1,
      volume: { '1day': 100, '7day': 700, '30day': 3000, allTime: 50000 },
      salesCount: 2000,
      ownerCount: 1500,
    }
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse(200, flat))

    const stats = await getCollectionStats()

    expect(stats.floorPrice).toBe(3.1)
  })
})

// ─── getSalesPage() ───────────────────────────────────────────────────────────

describe('getSalesPage()', () => {
  it('parses sales array with correct field mapping', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse(200, ME_SALES_FIXTURE))

    const page = await getSalesPage(100)

    expect(page.sales).toHaveLength(2)
    expect(page.sales[0].tokenId).toBe(42)
    expect(page.sales[0].priceBera).toBe(5.5)
    expect(page.sales[0].soldAt).toBe('2026-02-20T10:00:00Z')
    expect(page.sales[0].buyerAddress).toBe('0xabc')
    expect(page.sales[0].txHash).toBe('0x123')
  })

  it('returns continuation cursor when present', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse(200, ME_SALES_FIXTURE))

    const page = await getSalesPage(100)

    expect(page.continuation).toBe('cursor_abc123')
  })

  it('returns null continuation when exhausted', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(200, { sales: [], continuation: null }),
    )

    const page = await getSalesPage(100)

    expect(page.continuation).toBeNull()
  })

  it('forwards continuation cursor in request URL', async () => {
    let capturedUrl = ''
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      capturedUrl = String(url)
      return mockResponse(200, { sales: [], continuation: null })
    })

    await getSalesPage(50, 'my_cursor')

    expect(capturedUrl).toContain('continuation=my_cursor')
    expect(capturedUrl).toContain('limit=50')
  })

  it('handles empty sales array', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(200, { sales: [] }),
    )

    const page = await getSalesPage(100)

    expect(page.sales).toHaveLength(0)
    expect(page.continuation).toBeNull()
  })
})
