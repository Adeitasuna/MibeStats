/**
 * sync-sales.ts — Daily incremental sales sync.
 * Fetches new ME sales since last_synced_at and inserts them.
 * Run by GitHub Actions cron at 00:30 UTC daily.
 */

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSalesPage } from '../lib/me-api'

const prisma  = new PrismaClient()
const SLEEP_MS = 600

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('=== Daily sales sync ===')

  const syncState = await prisma.syncState.findUnique({ where: { key: 'sales_last_synced' } })
  const lastSynced = syncState ? new Date(syncState.value) : new Date(0)
  console.log(`Last synced: ${lastSynced.toISOString()}`)

  let continuation: string | undefined
  let totalNew = 0
  let done = false

  do {
    const result = await getSalesPage(100, continuation)
    const { sales } = result
    continuation = result.continuation ?? undefined

    // Stop pagination when we reach already-synced sales
    const newSales = sales.filter((s) => new Date(s.soldAt) > lastSynced)
    if (newSales.length < sales.length) done = true

    if (newSales.length > 0) {
      const data = newSales.map((s) => ({
        tokenId:       s.tokenId,
        priceBera:     new Prisma.Decimal(s.priceBera),
        soldAt:        new Date(s.soldAt),
        buyerAddress:  s.buyerAddress,
        sellerAddress: s.sellerAddress,
        txHash:        s.txHash,
      }))
      const r = await prisma.sale.createMany({ data, skipDuplicates: true })
      totalNew += r.count
    }

    if (continuation && !done) await sleep(SLEEP_MS)
  } while (continuation && !done)

  // Update per-token stats for affected tokens — aggregate over ALL sales history
  // (not just new ones) so sale_count and max_sale_price are always correct totals.
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
    where:  { key: 'sales_last_synced' },
    update: { value: new Date().toISOString() },
    create: { key: 'sales_last_synced', value: new Date().toISOString() },
  })

  console.log(`✅ sync-sales complete — ${totalNew} new sales`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
