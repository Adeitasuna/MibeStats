/**
 * Floor price provider — tries multiple sources in order:
 * 1. OpenSea API (if OPENSEA_API_KEY is set)
 * 2. Magic Eden API (legacy, may be deprecated)
 * 3. Database fallback (last known value)
 */

import { prisma } from '@/lib/db'

const OS_API_KEY = process.env.OPENSEA_API_KEY ?? ''
const OS_SLUG = process.env.OPENSEA_COLLECTION_SLUG ?? 'mibera333'
const ME_BASE = 'https://api-mainnet.magiceden.dev/v4/evm-public'
const ME_CONTRACT = process.env.ME_CONTRACT_ADDRESS ?? '0x6666397dfe9a8c469bf65dc744cb1c733416c420'

export interface FloorPriceResult {
  floorPrice: number | null
  source: 'opensea' | 'magiceden' | 'database'
  /** ISO timestamp of when this price was recorded (relevant for DB fallback) */
  asOf: string
}

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...opts, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Try OpenSea API */
async function tryOpenSea(): Promise<number | null> {
  if (!OS_API_KEY) return null

  const res = await fetchWithTimeout(
    `https://api.opensea.io/api/v2/collections/${OS_SLUG}/stats`,
    { headers: { 'x-api-key': OS_API_KEY, Accept: 'application/json' } },
  )
  if (!res.ok) return null

  const data = await res.json()
  const floor = data?.total?.floor_price ?? data?.floor_price ?? null
  return typeof floor === 'number' ? floor : null
}

/** Try Magic Eden API */
async function tryMagicEden(): Promise<number | null> {
  const token = process.env.ME_BEARER_TOKEN
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const url = `${ME_BASE}/orders/asks?chain=berachain&collectionId=${ME_CONTRACT}&status[]=active&sortBy=price&sortDir=asc&limit=1`
  const res = await fetchWithTimeout(url, { headers })
  if (!res.ok) return null

  const data = await res.json()
  const price = data?.asks?.[0]?.price?.amount?.native
  return typeof price === 'number' ? price : null
}

/** Fallback: last known floor price from DB */
async function fromDatabase(): Promise<{ price: number | null; asOf: string }> {
  // Try most recent floor history snapshot first
  const snapshot = await prisma.floorPriceHistory.findFirst({
    orderBy: { recordedAt: 'desc' },
  })
  if (snapshot?.floorPrice) {
    return {
      price: Number(snapshot.floorPrice),
      asOf: snapshot.recordedAt.toISOString(),
    }
  }

  // Fall back to collection stats cache
  const cached = await prisma.collectionStats.findUnique({ where: { id: 1 } })
  return {
    price: cached?.floorPrice ? Number(cached.floorPrice) : null,
    asOf: cached?.updatedAt?.toISOString() ?? new Date().toISOString(),
  }
}

/**
 * Get floor price from the best available source.
 */
export async function getFloorPriceFromBestSource(): Promise<FloorPriceResult> {
  const now = new Date().toISOString()

  // 1. Try OpenSea
  try {
    const price = await tryOpenSea()
    if (price != null) return { floorPrice: price, source: 'opensea', asOf: now }
  } catch { /* continue */ }

  // 2. Try Magic Eden
  try {
    const price = await tryMagicEden()
    if (price != null) return { floorPrice: price, source: 'magiceden', asOf: now }
  } catch { /* continue */ }

  // 3. Database fallback
  const db = await fromDatabase()
  return { floorPrice: db.price, source: 'database', asOf: db.asOf }
}
