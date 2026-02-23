/**
 * Magic Eden API wrapper for Berachain NFTs.
 * All calls are server-side only — ME_BEARER_TOKEN is never exposed to the client.
 */

const ME_BASE = 'https://api-mainnet.magiceden.dev/v3/rtp/berachain'
const COLLECTION_SLUG = process.env.NEXT_PUBLIC_ME_COLLECTION_SLUG ?? 'mibera333'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MECollectionStats {
  floorPrice: number | null
  volume24h: number | null
  volume7d: number | null
  volume30d: number | null
  volumeAllTime: number | null
  totalSales: number | null
  totalHolders: number | null
}

export interface MESale {
  tokenId: number
  priceBera: number
  soldAt: string      // ISO timestamp
  buyerAddress: string | null
  sellerAddress: string | null
  txHash: string | null
}

export interface MESalesPage {
  sales: MESale[]
  continuation: string | null
}

export class MEApiError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    message: string,
  ) {
    super(`ME API ${status} on ${endpoint}: ${message}`)
    this.name = 'MEApiError'
  }
}

// ─── Internal fetch with retry ────────────────────────────────────────────────

async function meFetch(endpoint: string, attempt = 0): Promise<Response> {
  const token = process.env.ME_BEARER_TOKEN
  if (!token) throw new Error('ME_BEARER_TOKEN is not set')

  const res = await fetch(`${ME_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    // next: { revalidate: 0 } — called from pipeline scripts, not Next.js cache
  })

  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    if (attempt >= 2) {
      throw new MEApiError(res.status, endpoint, 'Max retries exceeded')
    }
    const delay = Math.pow(2, attempt) * 1000   // 1s, 2s, 4s
    await new Promise((r) => setTimeout(r, delay))
    return meFetch(endpoint, attempt + 1)
  }

  if (!res.ok) {
    throw new MEApiError(res.status, endpoint, res.statusText)
  }

  return res
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch current collection-level stats (floor, volume, holders).
 * Single request — no rate limit pressure.
 */
export async function getCollectionStats(): Promise<MECollectionStats> {
  const res = await meFetch(`/collections/v7?id=${COLLECTION_SLUG}`)
  const json = await res.json()

  // Magic Eden v7 collections endpoint response shape
  const col = json?.collections?.[0] ?? json

  return {
    floorPrice:    toNumber(col?.floorAsk?.price?.amount?.native ?? col?.floorPrice),
    volume24h:     toNumber(col?.volume?.['1day']),
    volume7d:      toNumber(col?.volume?.['7day']),
    volume30d:     toNumber(col?.volume?.['30day']),
    volumeAllTime: toNumber(col?.volume?.allTime),
    totalSales:    toInt(col?.salesCount),
    totalHolders:  toInt(col?.ownerCount),
  }
}

/**
 * Fetch a page of sales for the collection.
 * @param limit     Items per page (max 100)
 * @param continuation  Pagination cursor from previous page
 */
export async function getSalesPage(
  limit = 100,
  continuation?: string,
): Promise<MESalesPage> {
  const params = new URLSearchParams({
    collection: COLLECTION_SLUG,
    limit:      String(limit),
    sortBy:     'time',
    sortDirection: 'desc',
  })
  if (continuation) params.set('continuation', continuation)

  const res  = await meFetch(`/sales/v6?${params}`)
  const json = await res.json()

  const sales = (json?.sales ?? []).map((s: Record<string, unknown>) => ({
    tokenId:       toInt((s?.token as Record<string, unknown>)?.tokenId) ?? 0,
    priceBera:     toNumber((s?.price as Record<string, unknown>)?.amount?.native) ?? 0,
    soldAt:        (s?.timestamp as string) ?? new Date().toISOString(),
    buyerAddress:  (s?.buyer as string) ?? null,
    sellerAddress: (s?.seller as string) ?? null,
    txHash:        (s?.txHash as string) ?? null,
  })) as MESale[]

  return {
    sales,
    continuation: (json?.continuation as string) ?? null,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toNumber(v: unknown): number | null {
  const n = Number(v)
  return isNaN(n) ? null : n
}

function toInt(v: unknown): number | null {
  const n = parseInt(String(v), 10)
  return isNaN(n) ? null : n
}
