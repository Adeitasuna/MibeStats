/**
 * sync-sales-opensea.ts — Incremental sales sync from OpenSea.
 * Fetches new OpenSea sales since last_synced_at and inserts them.
 */

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma   = new PrismaClient()
const SLEEP_MS = 300
const MAX_PAGES = 30

const OPENSEA_API_URL =
  'https://api.opensea.io/api/v2/events/collection/mibera333'

interface OpenSeaEvent {
  event_timestamp: number
  nft: { identifier: string }
  payment: { quantity: string; decimals: number }
  buyer: string
  seller: string
  transaction: string
}

interface OpenSeaResponse {
  asset_events: OpenSeaEvent[]
  next: string | null
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...opts, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchEventsPage(cursor?: string): Promise<OpenSeaResponse> {
  const url = new URL(OPENSEA_API_URL)
  url.searchParams.set('event_type', 'sale')
  url.searchParams.set('limit', '50')
  if (cursor) url.searchParams.set('next', cursor)

  const res = await fetchWithTimeout(url.toString(), {
    headers: {
      'x-api-key': process.env.OPENSEA_API_KEY!,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`OpenSea API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  if (!Array.isArray(data?.asset_events)) {
    throw new Error('Unexpected OpenSea response format')
  }

  return data as OpenSeaResponse
}

async function main() {
  console.log('=== OpenSea sales sync ===')

  if (!process.env.OPENSEA_API_KEY) {
    throw new Error('OPENSEA_API_KEY env variable is required')
  }

  const syncState = await prisma.syncState.findUnique({
    where: { key: 'sales_last_synced' },
  })
  const lastSynced = syncState ? new Date(syncState.value) : new Date(0)
  console.log(`Last synced: ${lastSynced.toISOString()}`)

  let cursor: string | undefined
  let totalNew = 0
  let done = false
  let page = 0

  do {
    page++
    console.log(`Fetching page ${page}...`)

    const result = await fetchEventsPage(cursor)
    const events = result.asset_events
    cursor = result.next ?? undefined

    // Parse and validate events into sale records
    const sales = []
    for (const e of events) {
      const tokenId = parseInt(e.nft?.identifier, 10)
      if (isNaN(tokenId) || tokenId < 1 || tokenId > 10000) {
        console.warn(`Skipping invalid tokenId: ${e.nft?.identifier}`)
        continue
      }

      const decimals = e.payment?.decimals ?? 18
      if (decimals < 0 || decimals > 30) {
        console.warn(`Skipping invalid decimals: ${decimals}`)
        continue
      }

      const quantity = BigInt(e.payment?.quantity ?? '0')
      if (quantity <= 0n) {
        console.warn(`Skipping zero/negative quantity for token ${tokenId}`)
        continue
      }

      const priceBera = new Prisma.Decimal(
        (quantity * 1_000_000n / BigInt(10 ** decimals)).toString()
      ).div(1_000_000)

      if (priceBera.lte(0) || priceBera.gt(1_000_000)) {
        console.warn(`Skipping unrealistic price ${priceBera} for token ${tokenId}`)
        continue
      }

      sales.push({
        tokenId,
        priceBera,
        soldAt: new Date(e.event_timestamp * 1000),
        buyerAddress: e.buyer ?? null,
        sellerAddress: e.seller ?? null,
        txHash: e.transaction ?? null,
      })
    }

    // Stop pagination when we reach already-synced sales
    const newSales = sales.filter((s) => s.soldAt > lastSynced)
    if (newSales.length < sales.length) done = true

    if (newSales.length > 0) {
      const r = await prisma.sale.createMany({
        data: newSales,
        skipDuplicates: true,
      })
      totalNew += r.count
    }

    if (cursor && !done && page < MAX_PAGES) await sleep(SLEEP_MS)
  } while (cursor && !done && page < MAX_PAGES)

  if (page >= MAX_PAGES) {
    console.log(`⚠️  Reached max pages limit (${MAX_PAGES})`)
  }

  // Update per-token stats for affected tokens — aggregate over ALL sales history
  if (totalNew > 0) {
    await prisma.$executeRaw`
      UPDATE tokens t
      SET
        sale_count      = agg.cnt,
        last_sale_price = agg.last_price,
        last_sale_date  = agg.last_date,
        max_sale_price  = agg.max_price
      FROM (
        SELECT
          token_id,
          COUNT(*)                                             AS cnt,
          (ARRAY_AGG(price_bera ORDER BY sold_at DESC))[1]    AS last_price,
          MAX(sold_at)                                         AS last_date,
          MAX(price_bera)                                      AS max_price
        FROM sales
        WHERE token_id IN (
          SELECT DISTINCT token_id FROM sales WHERE sold_at > ${lastSynced}
        )
        GROUP BY token_id
      ) agg
      WHERE t.token_id = agg.token_id
    `
  }

  await prisma.syncState.upsert({
    where: { key: 'sales_last_synced' },
    update: { value: new Date().toISOString() },
    create: { key: 'sales_last_synced', value: new Date().toISOString() },
  })

  console.log(`Done — ${totalNew} new sales inserted`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
