/**
 * Holder tier classification — single source of truth.
 * Used in bubblemap, portfolio, wallet views, etc.
 */

export const HOLDER_TIERS = ['ascendant', 'archon', 'whale', 'enthusiast', 'holder'] as const
export type HolderTier = (typeof HOLDER_TIERS)[number]

export const TIER_THRESHOLDS: { tier: HolderTier; min: number }[] = [
  { tier: 'ascendant', min: 420 },
  { tier: 'archon', min: 69 },
  { tier: 'whale', min: 25 },
  { tier: 'enthusiast', min: 10 },
  { tier: 'holder', min: 1 },
]

export function tierFromCount(count: number): HolderTier {
  for (const { tier, min } of TIER_THRESHOLDS) {
    if (count >= min) return tier
  }
  return 'holder'
}

export const TIER_COLORS: Record<string, string> = {
  ascendant: '#ffd700',
  archon: '#a855f7',
  whale: '#3fb950',
  enthusiast: '#38bdf8',
  holder: '#8b949e',
}

export const TIER_LABELS: Record<string, string> = {
  ascendant: 'Ascendant (420+)',
  archon: 'Archon (69-419)',
  whale: 'Whale (25-68)',
  enthusiast: 'Enthusiast (10-24)',
  holder: 'Holder (1-9)',
}
