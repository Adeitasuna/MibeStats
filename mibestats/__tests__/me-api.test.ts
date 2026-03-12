/**
 * Unit tests for lib/me-api.ts (v4 EVM API)
 *
 * Tests:
 *   - Retry logic: 3-attempt exponential backoff on 429 / 5xx
 *   - MEApiError thrown after max retries exhausted
 *   - getCollectionStats() response parsing (2 sequential meGet calls)
 *   - getSalesPage() pagination cursor forwarding
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCollectionStats, getSalesPage, MEApiError } from '../lib/me-api'

// ─── Fixtures (v4 response shapes) ──────────────────────────────────────────

const FLOOR_FIXTURE = {
  asks: [
    { price: { amount: { native: '4.2' } } },
  ],
}

const ACTIVITIES_FIXTURE = {
  activities: [
    {
      activityType: 'TRADE',
      timestamp: new Date(Date.now() - 3600_000).toISOString(), // 1h ago
      fromAddress: '0xdef',
      toAddress: '0xabc',
      unitPrice: { amount: { native: '5.5' } },
      asset: { id: '0x666:42' },
      transactionInfo: { transactionId: '0x123' },
    },
    {
      activityType: 'TRADE',
      timestamp: new Date(Date.now() - 7200_000).toISOString(), // 2h ago
      fromAddress: '0xbar',
      toAddress: '0xfoo',
      unitPrice: { amount: { native: '12.0' } },
      asset: { id: '0x666:777' },
      transactionInfo: { transactionId: '0x456' },
    },
  ],
  continuation: 'cursor_abc123',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Setup / teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  process.env.ME_BEARER_TOKEN = 'test-token'
})

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.ME_BEARER_TOKEN
})

// ─── Retry logic ────────────────────────────────────────────────────────────

describe('retry logic', () => {
  it('retries on 429 twice and succeeds on 3rd attempt', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      // First meGet (floor): fail twice, succeed third
      if (callCount <= 2) return mockResponse(429, { message: 'Rate limited' })
      if (callCount === 3) return mockResponse(200, FLOOR_FIXTURE)
      // Second meGet (activities): succeed immediately
      return mockResponse(200, ACTIVITIES_FIXTURE)
    })

    const result = await getCollectionStats()

    expect(callCount).toBe(4) // 3 for floor (2 retries + success) + 1 for activities
    expect(result.floorPrice).toBe(4.2)
  }, 15_000)

  it('retries on 500 and succeeds on 2nd attempt', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      // First meGet (floor): fail once, succeed second
      if (callCount === 1) return mockResponse(500, { message: 'Server error' })
      if (callCount === 2) return mockResponse(200, FLOOR_FIXTURE)
      // Second meGet (activities): succeed
      return mockResponse(200, ACTIVITIES_FIXTURE)
    })

    const result = await getCollectionStats()

    expect(callCount).toBe(3) // 2 for floor (1 retry + success) + 1 for activities
    expect(result.floorPrice).toBe(4.2)
  }, 15_000)

  it('throws MEApiError after 3 consecutive 429 responses', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return mockResponse(429, { message: 'Rate limited' })
    })

    await expect(getCollectionStats()).rejects.toBeInstanceOf(MEApiError)
  }, 15_000)

  it('sets status and endpoint on MEApiError', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return mockResponse(429, { message: 'Rate limited' })
    })

    const err: MEApiError = await getCollectionStats().catch((e) => e)
    expect(err.status).toBe(429)
    expect(err.endpoint).toContain('/orders/asks')
  }, 15_000)

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

// ─── getCollectionStats() — response parsing ────────────────────────────────

describe('getCollectionStats()', () => {
  it('parses floor price from asks endpoint and volume from activities', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      if (callCount === 1) return mockResponse(200, FLOOR_FIXTURE)
      return mockResponse(200, ACTIVITIES_FIXTURE)
    })

    const stats = await getCollectionStats()

    expect(stats.floorPrice).toBe(4.2)
    // volume24h = 5.5 + 12.0 = 17.5 (both activities within 24h)
    expect(stats.volume24h).toBe(17.5)
  })

  it('returns null for missing floor price', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      if (callCount === 1) return mockResponse(200, { asks: [] })
      return mockResponse(200, { activities: [] })
    })

    const stats = await getCollectionStats()

    expect(stats.floorPrice).toBeNull()
    expect(stats.volume24h).toBeNull()
    expect(stats.volume7d).toBeNull()
  })

  it('returns null volume fields that require full pagination', async () => {
    let callCount = 0
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      if (callCount === 1) return mockResponse(200, FLOOR_FIXTURE)
      return mockResponse(200, ACTIVITIES_FIXTURE)
    })

    const stats = await getCollectionStats()

    // v4 doesn't provide these without full pagination
    expect(stats.volume30d).toBeNull()
    expect(stats.volumeAllTime).toBeNull()
    expect(stats.totalSales).toBeNull()
    expect(stats.totalHolders).toBeNull()
  })
})

// ─── getSalesPage() ─────────────────────────────────────────────────────────

describe('getSalesPage()', () => {
  it('parses activities array with correct field mapping', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse(200, ACTIVITIES_FIXTURE))

    const page = await getSalesPage(100)

    expect(page.sales).toHaveLength(2)
    expect(page.sales[0].tokenId).toBe(42)
    expect(page.sales[0].priceBera).toBe(5.5)
    expect(page.sales[0].buyerAddress).toBe('0xabc')
    expect(page.sales[0].sellerAddress).toBe('0xdef')
    expect(page.sales[0].txHash).toBe('0x123')
  })

  it('returns continuation cursor when present', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse(200, ACTIVITIES_FIXTURE))

    const page = await getSalesPage(100)

    expect(page.continuation).toBe('cursor_abc123')
  })

  it('returns null continuation when exhausted', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(200, { activities: [], continuation: null }),
    )

    const page = await getSalesPage(100)

    expect(page.continuation).toBeNull()
  })

  it('forwards continuation cursor in request URL', async () => {
    let capturedUrl = ''
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      capturedUrl = String(url)
      return mockResponse(200, { activities: [], continuation: null })
    })

    await getSalesPage(50, 'my_cursor')

    expect(capturedUrl).toContain('continuation=my_cursor')
    expect(capturedUrl).toContain('limit=50')
  })

  it('handles empty activities array', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockResponse(200, { activities: [] }),
    )

    const page = await getSalesPage(100)

    expect(page.sales).toHaveLength(0)
    expect(page.continuation).toBeNull()
  })
})
