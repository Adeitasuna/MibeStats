/**
 * Unit tests for lib/traits.ts
 *
 * Tests:
 *   - toTraitCounts: filters nulls, computes percentage, sorts by count descending
 *   - toTraitCounts: handles custom total (e.g., 42 for grails)
 *   - toTraitCounts: handles empty input
 */

import { describe, it, expect } from 'vitest'
import { toTraitCounts } from '../lib/traits'

describe('toTraitCounts', () => {
  it('filters null values and computes pct correctly', () => {
    const rows = [
      { value: 'Milady',    count: BigInt(3000) },
      { value: 'Freetekno', count: BigInt(4000) },
      { value: null,         count: BigInt(500) },
      { value: 'Acidhouse', count: BigInt(3000) },
    ]

    const result = toTraitCounts(rows)

    expect(result).toHaveLength(3)
    // Sorted by count descending
    expect(result[0].value).toBe('Freetekno')
    expect(result[0].count).toBe(4000)
    expect(result[0].pct).toBe(40)

    expect(result[1].count).toBe(3000) // Milady or Acidhouse (same count)
    expect(result[2].count).toBe(3000)
  })

  it('computes percentage with default total 10000', () => {
    const rows = [{ value: 'Air', count: BigInt(2500) }]
    const result = toTraitCounts(rows)

    expect(result[0].pct).toBe(25)
  })

  it('computes percentage with custom total (e.g., 42 for grails)', () => {
    const rows = [{ value: 'Zodiac', count: BigInt(12) }]
    const result = toTraitCounts(rows, 42)

    // 12/42 * 100 = 28.57...
    expect(result[0].pct).toBe(28.57)
  })

  it('returns empty array for empty input', () => {
    expect(toTraitCounts([])).toEqual([])
  })

  it('returns empty array when all values are null', () => {
    const rows = [
      { value: null, count: BigInt(100) },
      { value: null, count: BigInt(200) },
    ]
    expect(toTraitCounts(rows)).toEqual([])
  })

  it('handles single-element input', () => {
    const rows = [{ value: 'Only', count: BigInt(10000) }]
    const result = toTraitCounts(rows)

    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('Only')
    expect(result[0].count).toBe(10000)
    expect(result[0].pct).toBe(100)
  })

  it('rounds percentage to 2 decimal places', () => {
    // 333 / 10000 = 3.33%
    const rows = [{ value: 'Rare', count: BigInt(333) }]
    const result = toTraitCounts(rows)

    expect(result[0].pct).toBe(3.33)
  })
})
