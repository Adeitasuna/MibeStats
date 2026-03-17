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

async function fetchEventsPage(cursor?: string): Promise<OpenSeaResponse> {
  const url = new URL(OPENSEA_API_URL)
  url.searchParams.set('event_type', 'sale')
  url.searchParams.set('limit', '50')
  if (cursor) url.searchParams.set('next', cursor)

  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': process.env.OPENSEA_API_KEY!,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`OpenSea API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<OpenSeaResponse>
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

    // Parse events into sale records
    const sales = events.map((e) => ({
      tokenId: parseInt(e.nft.identifier, 10),
      priceBera: new Prisma.Decimal(
        (BigInt(e.payment.quantity) * 1_000_000n / BigInt(10 ** e.payment.decimals)).toString()
      ).div(1_000_000),
      soldAt: new Date(e.event_timestamp * 1000),
      buyerAddress: e.buyer,
      sellerAddress: e.seller,
      txHash: e.transaction,
    }))

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
