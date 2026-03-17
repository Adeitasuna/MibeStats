/**
 * Floor price provider — OpenSea API with DB fallback.
 */

import { prisma } from '@/lib/db'

const OS_API_KEY = process.env.OPENSEA_API_KEY ?? ''
const OS_SLUG = process.env.OPENSEA_COLLECTION_SLUG ?? 'mibera333'

export interface FloorPriceResult {
  floorPrice: number | null
  source: 'opensea' | 'database'
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

/** Fetch floor price from OpenSea API */
async function tryOpenSea(): Promise<number | null> {
  if (!OS_API_KEY) return null

  const res = await fetchWithTimeout(
    `https://api.opensea.io/api/v2/collections/${OS_SLUG}/stats`,
    { headers: { 'x-api-key': OS_API_KEY, Accept: 'application/json' } },
  )
  if (!res.ok) return null

  const data = await res.json()
  const floor = data?.total?.floor_price ?? data?.floor_price ?? null
  if (typeof floor !== 'number' || floor <= 0 || floor > 1_000_000) return null
  return floor
}

/** Fallback: last known floor price from DB */
async function fromDatabase(): Promise<{ price: number | null; asOf: string }> {
  const snapshot = await prisma.floorPriceHistory.findFirst({
    orderBy: { recordedAt: 'desc' },
  })
  if (snapshot?.floorPrice) {
    return {
      price: Number(snapshot.floorPrice),
      asOf: snapshot.recordedAt.toISOString(),
    }
  }

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

  // 2. Database fallback
  const db = await fromDatabase()
  return { floorPrice: db.price, source: 'database', asOf: db.asOf }
}
