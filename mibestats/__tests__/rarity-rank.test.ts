/**
 * Unit tests for rarity_rank computation logic (from import-codex.ts)
 *
 * Tests:
 *   - RANK (not DENSE_RANK) — tied scores get the same rank, next rank skips
 *   - Descending order: highest swag_score = rank 1
 *   - All same score = all rank 1
 */

import { describe, it, expect } from 'vitest'

/**
 * Pure function that mirrors the SQL RANK() OVER (ORDER BY swag_score DESC)
 * used in import-codex.ts to compute rarity_rank for all tokens.
 */
function computeRarityRanks(
  tokens: { tokenId: number; swagScore: number }[],
): Map<number, number> {
  const sorted = [...tokens].sort((a, b) => b.swagScore - a.swagScore)
  const ranks = new Map<number, number>()

  for (let i = 0; i < sorted.length; i++) {
    // RANK: position in 1-based sorted array
    // Tied tokens get the rank of the first occurrence
    if (i === 0 || sorted[i].swagScore !== sorted[i - 1].swagScore) {
      ranks.set(sorted[i].tokenId, i + 1)
    } else {
      ranks.set(sorted[i].tokenId, ranks.get(sorted[i - 1].tokenId)!)
    }
  }

  return ranks
}

describe('rarity_rank computation (RANK semantics)', () => {
  it('assigns rank 1 to the highest swag_score', () => {
    const tokens = [
      { tokenId: 1, swagScore: 50 },
      { tokenId: 2, swagScore: 80 },
      { tokenId: 3, swagScore: 30 },
      { tokenId: 4, swagScore: 95 },
      { tokenId: 5, swagScore: 70 },
    ]

    const ranks = computeRarityRanks(tokens)

    expect(ranks.get(4)).toBe(1)  // 95 → rank 1
    expect(ranks.get(2)).toBe(2)  // 80 → rank 2
    expect(ranks.get(5)).toBe(3)  // 70 → rank 3
    expect(ranks.get(1)).toBe(4)  // 50 → rank 4
    expect(ranks.get(3)).toBe(5)  // 30 → rank 5
  })

  it('gives tied scores the same rank (RANK, not DENSE_RANK)', () => {
    const tokens = [
      { tokenId: 1, swagScore: 90 },
      { tokenId: 2, swagScore: 80 },
      { tokenId: 3, swagScore: 80 },
      { tokenId: 4, swagScore: 70 },
      { tokenId: 5, swagScore: 80 },
    ]

    const ranks = computeRarityRanks(tokens)

    expect(ranks.get(1)).toBe(1)  // 90 → rank 1
    expect(ranks.get(2)).toBe(2)  // 80 → rank 2 (tied)
    expect(ranks.get(3)).toBe(2)  // 80 → rank 2 (tied)
    expect(ranks.get(5)).toBe(2)  // 80 → rank 2 (tied)
    expect(ranks.get(4)).toBe(5)  // 70 → rank 5 (skips 3 and 4)
  })

  it('all same score = all rank 1', () => {
    const tokens = [
      { tokenId: 1, swagScore: 50 },
      { tokenId: 2, swagScore: 50 },
      { tokenId: 3, swagScore: 50 },
    ]

    const ranks = computeRarityRanks(tokens)

    expect(ranks.get(1)).toBe(1)
    expect(ranks.get(2)).toBe(1)
    expect(ranks.get(3)).toBe(1)
  })

  it('single token gets rank 1', () => {
    const ranks = computeRarityRanks([{ tokenId: 42, swagScore: 100 }])
    expect(ranks.get(42)).toBe(1)
  })

  it('handles empty input', () => {
    const ranks = computeRarityRanks([])
    expect(ranks.size).toBe(0)
  })
})
