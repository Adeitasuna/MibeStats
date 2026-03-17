import type { MapPoint } from './map-types'

// ── Color palettes ──────────────────────────────────────────────────────

const ANCESTOR_COLORS: Record<string, string> = {
  Greek: '#ffd700', Indian: '#ff6b35', Chinese: '#ff69b4', Japanese: '#e63946',
  Egyptian: '#f4a261', Roman: '#8338ec', Persian: '#06d6a0', Celtic: '#118ab2',
  Viking: '#264653', Aztec: '#e76f51', Mayan: '#2a9d8f', Inca: '#e9c46a',
  Sumerian: '#f4845f', Babylonian: '#7209b7', Mongol: '#3a0ca3', Ottoman: '#4361ee',
  Polynesian: '#4cc9f0', African: '#fb5607', Aboriginal: '#ff006e', Norse: '#8ac926',
  Tibetan: '#ffbe0b', Korean: '#3f37c9', Thai: '#480ca8', Slavic: '#b5179e',
  Arabic: '#560bad', Native: '#7400b8', Mesopotamian: '#6930c3', Hebrew: '#5390d9',
  Phoenician: '#4ea8de', Etruscan: '#48bfe3', Minoan: '#56cfe1', Mycenaean: '#64dfdf',
  Hittite: '#72efdd',
}

const ELEMENT_COLORS: Record<string, string> = {
  Earth: '#3fb950', Fire: '#f85149', Water: '#58a6ff', Air: '#bc8cff',
}

const SWAG_RANK_COLORS: Record<string, string> = {
  Common: '#8b949e', Uncommon: '#3fb950', Rare: '#58a6ff',
  Epic: '#bc8cff', Legendary: '#ffd700', Mythical: '#ff006e',
}

const ZODIAC_COLORS: Record<string, string> = {
  Aries: '#f85149', Taurus: '#3fb950', Gemini: '#ffd700', Cancer: '#58a6ff',
  Leo: '#ff6b35', Virgo: '#8ac926', Libra: '#bc8cff', Scorpio: '#e63946',
  Sagittarius: '#f4a261', Capricorn: '#264653', Aquarius: '#4cc9f0', Pisces: '#7209b7',
}

// Known color maps per category
export const KNOWN_COLORS: Partial<Record<ColorByKey, Record<string, string>>> = {
  ancestor: ANCESTOR_COLORS,
  element: ELEMENT_COLORS,
  swagRank: SWAG_RANK_COLORS,
  sunSign: ZODIAC_COLORS,
  moonSign: ZODIAC_COLORS,
  ascendingSign: ZODIAC_COLORS,
}

// Generate distinct hue-based colors for unknown categories
export const GENERATED_PALETTE = [
  '#ffd700', '#ff6b35', '#ff69b4', '#e63946', '#f4a261', '#8338ec', '#06d6a0',
  '#118ab2', '#e76f51', '#2a9d8f', '#e9c46a', '#f4845f', '#7209b7', '#4361ee',
  '#4cc9f0', '#fb5607', '#ff006e', '#8ac926', '#ffbe0b', '#3f37c9', '#480ca8',
  '#b5179e', '#560bad', '#7400b8', '#6930c3', '#5390d9', '#4ea8de', '#48bfe3',
  '#56cfe1', '#64dfdf', '#72efdd', '#3a0ca3', '#bc8cff', '#58a6ff', '#3fb950',
]

export function buildColorMap(values: string[], known?: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {}
  let paletteIdx = 0
  for (const v of values) {
    if (known?.[v]) {
      map[v] = known[v]
    } else {
      map[v] = GENERATED_PALETTE[paletteIdx % GENERATED_PALETTE.length]
      paletteIdx++
    }
  }
  return map
}

export const COLOR_BY_OPTIONS = [
  { key: 'ancestor',      label: 'Ancestor' },
  { key: 'archetype',     label: 'Archetype' },
  { key: 'element',       label: 'Element' },
  { key: 'timePeriod',    label: 'Time Period' },
  { key: 'swagRank',      label: 'Swag Rank' },
  { key: 'sunSign',       label: 'Sun Sign' },
  { key: 'moonSign',      label: 'Moon Sign' },
  { key: 'ascendingSign', label: 'Ascending' },
] as const

export type ColorByKey = typeof COLOR_BY_OPTIONS[number]['key']

export function getPointValue(point: MapPoint, key: ColorByKey): string | null {
  switch (key) {
    case 'ancestor':      return point.ancestor
    case 'archetype':     return point.archetype
    case 'element':       return point.element
    case 'timePeriod':    return point.timePeriod
    case 'swagRank':      return point.swagRank
    case 'sunSign':       return point.sunSign
    case 'moonSign':      return point.moonSign
    case 'ascendingSign': return point.ascendingSign
  }
}
