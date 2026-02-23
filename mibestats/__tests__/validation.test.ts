/**
 * Unit tests for lib/validation.ts
 *
 * Tests:
 *   - addressSchema: valid EIP-55, lowercase, invalid
 *   - tokenQuerySchema: valid params, out-of-range limit, invalid sort
 *   - salesQuerySchema: valid params, invalid token_id
 *   - tokenIdSchema: boundaries (1, 10000, 0, 10001)
 *   - floorHistoryQuerySchema: valid and invalid range values
 */

import { describe, it, expect } from 'vitest'
import {
  addressSchema,
  tokenQuerySchema,
  salesQuerySchema,
  tokenIdSchema,
  floorHistoryQuerySchema,
} from '../lib/validation'

// ─── addressSchema ────────────────────────────────────────────────────────────

describe('addressSchema', () => {
  it('accepts a valid EIP-55 checksummed address', () => {
    // Known valid EIP-55 address
    const addr = '0x6666397DFe9a8c469BF65dc744CB1C733416c420'
    expect(addressSchema.safeParse(addr).success).toBe(true)
  })

  it('accepts an all-lowercase address (valid EIP-55 normalized form)', () => {
    const addr = '0x6666397dfe9a8c469bf65dc744cb1c733416c420'
    expect(addressSchema.safeParse(addr).success).toBe(true)
  })

  it('rejects a random non-address string', () => {
    expect(addressSchema.safeParse('notanaddress').success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(addressSchema.safeParse('').success).toBe(false)
  })

  it('rejects an address with wrong checksum casing', () => {
    // Flip a letter's case to break the checksum
    const addr = '0x6666397dFe9a8c469BF65dc744CB1C733416c420'
    expect(addressSchema.safeParse(addr).success).toBe(false)
  })
})

// ─── tokenQuerySchema ─────────────────────────────────────────────────────────

describe('tokenQuerySchema', () => {
  it('parses empty params with safe defaults', () => {
    const result = tokenQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sort).toBe('swag_desc')
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  it('accepts valid filter + sort + pagination', () => {
    const result = tokenQuerySchema.safeParse({
      archetype: 'Milady',
      sort:      'id_asc',
      page:      '2',
      limit:     '100',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.archetype).toBe('Milady')
      expect(result.data.sort).toBe('id_asc')
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(100)
    }
  })

  it('rejects limit > 100', () => {
    expect(tokenQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })

  it('rejects limit = 0', () => {
    expect(tokenQuerySchema.safeParse({ limit: '0' }).success).toBe(false)
  })

  it('rejects unknown sort value', () => {
    expect(tokenQuerySchema.safeParse({ sort: 'random' }).success).toBe(false)
  })

  it('rejects invalid swag_rank', () => {
    expect(tokenQuerySchema.safeParse({ swag_rank: 'Z' }).success).toBe(false)
  })

  it('accepts all valid swag_rank values', () => {
    for (const rank of ['SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'F']) {
      expect(tokenQuerySchema.safeParse({ swag_rank: rank }).success).toBe(true)
    }
  })

  it('coerces is_grail string "true" to boolean', () => {
    const result = tokenQuerySchema.safeParse({ is_grail: 'true' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.is_grail).toBe(true)
  })

  it('rejects archetype longer than 50 chars', () => {
    expect(tokenQuerySchema.safeParse({ archetype: 'A'.repeat(51) }).success).toBe(false)
  })
})

// ─── salesQuerySchema ─────────────────────────────────────────────────────────

describe('salesQuerySchema', () => {
  it('parses empty params with defaults', () => {
    const result = salesQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  it('accepts valid full params', () => {
    const result = salesQuerySchema.safeParse({
      token_id:  '42',
      min_price: '1.5',
      max_price: '100',
      from_date: '2026-01-01T00:00:00Z',
      to_date:   '2026-12-31T23:59:59Z',
      is_grail:  'false',
      page:      '3',
      limit:     '200',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.token_id).toBe(42)
      expect(result.data.min_price).toBe(1.5)
      expect(result.data.limit).toBe(200)
    }
  })

  it('rejects token_id = 0', () => {
    expect(salesQuerySchema.safeParse({ token_id: '0' }).success).toBe(false)
  })

  it('rejects token_id > 10000', () => {
    expect(salesQuerySchema.safeParse({ token_id: '10001' }).success).toBe(false)
  })

  it('rejects limit > 200', () => {
    expect(salesQuerySchema.safeParse({ limit: '201' }).success).toBe(false)
  })

  it('rejects negative min_price', () => {
    expect(salesQuerySchema.safeParse({ min_price: '-1' }).success).toBe(false)
  })

  it('rejects invalid datetime format for from_date', () => {
    expect(salesQuerySchema.safeParse({ from_date: 'not-a-date' }).success).toBe(false)
  })

  it('accepts ISO datetime with timezone offset', () => {
    expect(
      salesQuerySchema.safeParse({ from_date: '2026-01-01T00:00:00+05:30' }).success,
    ).toBe(true)
  })
})

// ─── tokenIdSchema ────────────────────────────────────────────────────────────

describe('tokenIdSchema', () => {
  it('accepts 1 (minimum)', () => {
    expect(tokenIdSchema.safeParse('1').success).toBe(true)
  })

  it('accepts 10000 (maximum)', () => {
    expect(tokenIdSchema.safeParse('10000').success).toBe(true)
  })

  it('accepts arbitrary valid id', () => {
    expect(tokenIdSchema.safeParse('333').success).toBe(true)
  })

  it('rejects 0', () => {
    expect(tokenIdSchema.safeParse('0').success).toBe(false)
  })

  it('rejects 10001', () => {
    expect(tokenIdSchema.safeParse('10001').success).toBe(false)
  })

  it('rejects non-numeric string', () => {
    expect(tokenIdSchema.safeParse('abc').success).toBe(false)
  })

  it('rejects float', () => {
    expect(tokenIdSchema.safeParse('42.5').success).toBe(false)
  })
})

// ─── floorHistoryQuerySchema ──────────────────────────────────────────────────

describe('floorHistoryQuerySchema', () => {
  it('accepts "7d"', () => {
    expect(floorHistoryQuerySchema.safeParse({ range: '7d' }).success).toBe(true)
  })

  it('accepts "30d"', () => {
    expect(floorHistoryQuerySchema.safeParse({ range: '30d' }).success).toBe(true)
  })

  it('accepts "all"', () => {
    expect(floorHistoryQuerySchema.safeParse({ range: 'all' }).success).toBe(true)
  })

  it('defaults to "30d" when range is omitted', () => {
    const result = floorHistoryQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.range).toBe('30d')
  })

  it('rejects unknown range value', () => {
    expect(floorHistoryQuerySchema.safeParse({ range: '90d' }).success).toBe(false)
  })
})
