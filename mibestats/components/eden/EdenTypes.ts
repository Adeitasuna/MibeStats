/* ── Types ── */

export interface CollectionData {
  floorPrice: number | null
  floorPriceSource?: 'opensea' | 'magiceden' | 'database'
  floorPriceAsOf?: string
  volume24h: number | null
  volume7d: number | null
  volume30d: number | null
  volumeAllTime: number | null
  totalSales: number | null
  totalHolders: number | null
}

export interface FloorSnapshot {
  date: string
  floorPrice: number
}

export interface BestSale {
  id: string
  tokenId: number
  priceBera: number
  soldAt: string
  imageUrl: string | null
  swagRank: string | null
  isGrail: boolean
  grailName: string | null
  magicEdenUrl: string
}

export interface SalesDistItem {
  saleCount: number
  tokenCount: number
}

export interface MostSoldItem {
  tokenId: number
  saleCount: number
  transferCount: number
  imageUrl: string | null
  swagRank: string
  isGrail: boolean
  grailName: string | null
  maxSalePrice: number | null
  lastSalePrice: number | null
  magicEdenUrl: string
}

export interface EdenApiData {
  bestSales: BestSale[]
  salesDistribution: SalesDistItem[]
  mostSold: MostSoldItem[]
  salesStats: {
    count1d: number
    count7d: number
    countAll: number
    volume1d: number
    volume7d: number
    volumeAll: number
    lowestSale24h: number | null
    highestSale24h: number | null
  }
  grailStats: {
    grails: number
    nonGrails: number
    burned: number
  }
}

/* ── Helpers ── */

export const PIE_COLORS = ['#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149', '#bc8cff', '#f0883e', '#8b949e']

export function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—'
  return `${value.toFixed(decimals)} BERA`
}

export function fmtShort(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString()
}

export type Range = '7d' | '30d' | 'all'
