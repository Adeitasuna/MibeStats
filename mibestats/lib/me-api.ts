/**
 * Magic Eden v4 EVM API wrapper for Berachain NFTs.
 * All calls are server-side only — ME_BEARER_TOKEN is never exposed to the client.
 *
 * Migrated from deprecated /v3/rtp/ (Reservoir proxy) to /v4/evm-public/ endpoints.
 */

const ME_BASE = 'https://api-mainnet.magiceden.dev/v4/evm-public'
const CHAIN = 'berachain'
const CONTRACT = process.env.ME_CONTRACT_ADDRESS ?? '0x6666397dfe9a8c469bf65dc744cb1c733416c420'
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

async function meGet(endpoint: string, attempt = 0): Promise<Response> {
  const token = process.env.ME_BEARER_TOKEN
  if (!token) throw new Error('ME_BEARER_TOKEN is not set')

  const res = await fetch(`${ME_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    if (attempt >= 2) {
      throw new MEApiError(res.status, endpoint, 'Max retries exceeded')
    }
    const delay = Math.pow(2, attempt) * 1000
    await new Promise((r) => setTimeout(r, delay))
    return meGet(endpoint, attempt + 1)
  }

  if (!res.ok) {
    throw new MEApiError(res.status, endpoint, res.statusText)
  }

  return res
}

async function mePost(endpoint: string, body: unknown, attempt = 0): Promise<Response> {
  const token = process.env.ME_BEARER_TOKEN
  if (!token) throw new Error('ME_BEARER_TOKEN is not set')

  const res = await fetch(`${ME_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    if (attempt >= 2) {
      throw new MEApiError(res.status, endpoint, 'Max retries exceeded')
    }
    const delay = Math.pow(2, attempt) * 1000
    await new Promise((r) => setTimeout(r, delay))
    return mePost(endpoint, body, attempt + 1)
  }

  if (!res.ok) {
    throw new MEApiError(res.status, endpoint, res.statusText)
  }

  return res
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch current collection-level stats (floor, volume, holders).
 * Uses v4 asks + activities endpoints since v4 collections doesn't return stats.
 */
export async function getCollectionStats(): Promise<MECollectionStats> {
  // Floor price: lowest active listing
  const floorRes = await meGet(
    `/orders/asks?chain=${CHAIN}&collectionId=${CONTRACT}&status[]=active&sortBy=price&sortDir=asc&limit=1`,
  )
  const floorJson = await floorRes.json()
  const floorAsk = (floorJson as { asks?: { price?: { amount?: { native?: string } } }[] })?.asks?.[0]
  const floorPrice = toNumber(floorAsk?.price?.amount?.native)

  // Volume: compute from recent activity (24h, 7d, 30d)
  // We fetch recent trades and sum — ME v4 doesn't have a dedicated volume endpoint
  const now = Date.now()
  const oneDayAgo  = new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch up to 100 recent trades for volume calculation
  const actRes = await meGet(
    `/activities?chain=${CHAIN}&activityTypes[]=TRADE&collectionId=${CONTRACT}&limit=100`,
  )
  const actJson = await actRes.json()
  const activities = (actJson as { activities?: Activity[] })?.activities ?? []

  let volume24h = 0
  let volume7d = 0
  let volumeAll = 0
  for (const a of activities) {
    const price = toNumber(a.unitPrice?.amount?.native) ?? 0
    const ts = new Date(a.timestamp).getTime()
    volumeAll += price
    if (a.timestamp >= sevenDaysAgo) volume7d += price
    if (a.timestamp >= oneDayAgo) volume24h += price
  }

  return {
    floorPrice,
    volume24h:     volume24h > 0 ? volume24h : null,
    volume7d:      volume7d > 0 ? volume7d : null,
    volume30d:     null,    // would require paginating all 30d trades
    volumeAllTime: null,    // not available from v4 without full pagination
    totalSales:    null,    // not available from v4 collections
    totalHolders:  null,    // not available from v4 collections
  }
}

/**
 * Fetch a page of sales (TRADE activities) for the collection.
 */
export async function getSalesPage(
  limit = 100,
  continuation?: string,
): Promise<MESalesPage> {
  const params = new URLSearchParams({
    chain:        CHAIN,
    'activityTypes[]': 'TRADE',
    collectionId: CONTRACT,
    limit:        String(Math.min(limit, 100)),
  })
  if (continuation) params.set('continuation', continuation)

  const res  = await meGet(`/activities?${params}`)
  const json = await res.json()
  const activities = (json as { activities?: Activity[]; continuation?: string })

  const sales: MESale[] = (activities.activities ?? []).map((a) => ({
    tokenId:       toInt(a.asset?.id?.split(':')[1]) ?? 0,
    priceBera:     toNumber(a.unitPrice?.amount?.native) ?? 0,
    soldAt:        a.timestamp ?? new Date().toISOString(),
    buyerAddress:  a.toAddress ?? null,
    sellerAddress: a.fromAddress ?? null,
    txHash:        a.transactionInfo?.transactionId ?? null,
  }))

  return {
    sales,
    continuation: activities.continuation ?? null,
  }
}

// ─── Internal types ──────────────────────────────────────────────────────────

interface Activity {
  activityType: string
  timestamp: string
  fromAddress: string
  toAddress: string
  unitPrice?: { amount?: { native?: string; fiat?: { usd?: string } } }
  asset?: { id?: string }
  transactionInfo?: { transactionId?: string }
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
