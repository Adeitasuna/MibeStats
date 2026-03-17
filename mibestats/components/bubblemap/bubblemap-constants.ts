export const TIERS = ['whale', 'diamond', 'gold', 'silver', 'bronze', 'holder'] as const
export const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  diamond: '#b9f2ff',
  gold: '#f0a030',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  holder: '#555',
}
export const TIER_LABELS: Record<string, string> = {
  whale: 'Whale (100+)',
  diamond: 'Diamond (35-99)',
  gold: 'Gold (10-34)',
  silver: 'Silver (4-9)',
  bronze: 'Bronze (2-3)',
  holder: 'Holder (1)',
}
export const TIER_ORDER = ['whale', 'diamond', 'gold', 'silver', 'bronze', 'holder'] as const
export const PIE_COLORS = ['#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149', '#bc8cff', '#f0883e', '#8b949e', '#a5d6ff', '#ffc658', '#82ca9d']
export const DISPLAY_LIMIT = 200
export const DEFAULT_PAGE_SIZE = 20
