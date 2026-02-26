// MibeStats — shared TypeScript types

export type SwagRank = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface Token {
  tokenId: number
  archetype: string
  ancestor: string
  timePeriod: string
  birthday: string | null
  birthCoordinates: string | null
  element: string | null
  sunSign: string | null
  moonSign: string | null
  ascendingSign: string | null
  swagScore: number
  swagRank: SwagRank
  rarityRank: number | null
  background: string | null
  body: string | null
  eyes: string | null
  eyebrows: string | null
  mouth: string | null
  hair: string | null
  shirt: string | null
  hat: string | null
  glasses: string | null
  mask: string | null
  earrings: string | null
  faceAccessory: string | null
  tattoo: string | null
  item: string | null
  drug: string | null
  isGrail: boolean
  grailName: string | null
  grailCategory: string | null
  imageUrl: string | null
  ownerAddress: string | null
  lastSalePrice: number | null
  maxSalePrice: number | null
  saleCount: number
}

export interface Sale {
  id: string
  tokenId: number
  priceBera: number
  priceUsd: number | null
  soldAt: string
  buyerAddress: string | null
  sellerAddress: string | null
  txHash: string | null
  marketplace: string
  token?: Pick<Token, 'tokenId' | 'imageUrl' | 'swagRank' | 'isGrail'>
}

export interface CollectionStats {
  floorPrice: number | null
  volume24h: number | null
  volume7d: number | null
  volume30d: number | null
  volumeAllTime: number | null
  totalSales: number | null
  totalHolders: number | null
  updatedAt: string
}

export interface CollectionResponse extends CollectionStats {
  recentSales: Sale[]
  topSales: Sale[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
}

export interface FloorSnapshot {
  date: string
  floorPrice: number
}

export interface TraitCount {
  value: string
  count: number
  pct: number
}

export interface TraitDistribution {
  archetypes: TraitCount[]
  ancestors: TraitCount[]
  elements: TraitCount[]
  timePeriods: TraitCount[]
  sunSigns: TraitCount[]
  moonSigns: TraitCount[]
  ascendingSigns: TraitCount[]
  drugs: TraitCount[]
  backgrounds: TraitCount[]
  bodies: TraitCount[]
  eyes: TraitCount[]
  eyebrows: TraitCount[]
  mouths: TraitCount[]
  hairs: TraitCount[]
  hats: TraitCount[]
  glasses: TraitCount[]
  masks: TraitCount[]
  earrings: TraitCount[]
  faceAccessories: TraitCount[]
  tattoos: TraitCount[]
  items: TraitCount[]
  shirts: TraitCount[]
  swagRanks: TraitCount[]
  grailCategories: TraitCount[]
  grailCount: number
}

export interface PortfolioStats {
  count: number
  estimatedValue: number | null
  avgRarityRank: number | null
  highestSwagScore: number | null
  grailCount: number
}

export interface PortfolioResponse {
  address: string
  tokens: Token[]
  stats: PortfolioStats
}

export const CONTRACT_ADDRESS = '0x6666397DFe9a8c469BF65dc744CB1C733416c420'
export const CHAIN_ID = 80094
export const TOKEN_COUNT = 10000

export function magicEdenUrl(tokenId: number): string {
  return `https://magiceden.io/item-details/berachain/${CONTRACT_ADDRESS}/${tokenId}`
}
