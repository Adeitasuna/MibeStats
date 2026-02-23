/**
 * import-sales.ts — Bulk import all historical Magic Eden sales.
 *
 * Paginates through all ME sales for mibera333, inserts into the sales table,
 * and updates per-token sale stats. Rate-limited: 0.6s between pages.
 *
 * Usage:
 *   npx tsx scripts/import-sales.ts
 *
 * Idempotent: uses skipDuplicates on tx_hash.
 */

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { getSalesPage } from '../lib/me-api'

const prisma = new PrismaClient()
const SLEEP_MS = 600   // 0.6s between pages — stay under ME rate limit

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('=== Magic Eden historical sales import ===\n')

  let continuation: string | undefined
  let totalImported = 0
  let page = 0

  do {
    page++
    const result = await getSalesPage(100, continuation)
    const { sales } = result
    continuation = result.continuation ?? undefined

    if (sales.length === 0) break

    const data = sales.map((s) => ({
      tokenId:       s.tokenId,
      priceBera:     new Prisma.Decimal(s.priceBera),
      soldAt:        new Date(s.soldAt),
      buyerAddress:  s.buyerAddress,
      sellerAddress: s.sellerAddress,
      txHash:        s.txHash,
    }))

    const result2 = await prisma.sale.createMany({ data, skipDuplicates: true })
    totalImported += result2.count

    if (page % 10 === 0 || !continuation) {
      console.log(`  Page ${page}: +${result2.count} sales (total: ${totalImported})`)
    }

    if (continuation) await sleep(SLEEP_MS)
  } while (continuation)

  // Update per-token sale stats
  console.log('\nUpdating per-token sale stats...')
  await prisma.$executeRaw`
    UPDATE tokens t
    SET
      sale_count      = agg.cnt,
      last_sale_price = agg.last_price,
      last_sale_date  = agg.last_date,
      max_sale_price  = agg.max_price,
      max_sale_date   = agg.max_date
    FROM (
      SELECT
        token_id,
        COUNT(*)                                             AS cnt,
        (ARRAY_AGG(price_bera ORDER BY sold_at DESC))[1]    AS last_price,
        MAX(sold_at)                                         AS last_date,
        MAX(price_bera)                                      AS max_price,
        (ARRAY_AGG(sold_at ORDER BY price_bera DESC))[1]    AS max_date
      FROM sales
      GROUP BY token_id
    ) agg
    WHERE t.token_id = agg.token_id
  `

  // Record last sync time
  await prisma.syncState.upsert({
    where:  { key: 'sales_last_synced' },
    update: { value: new Date().toISOString() },
    create: { key: 'sales_last_synced', value: new Date().toISOString() },
  })

  const totalSales = await prisma.sale.count()
  console.log(`\n✅ import-sales complete — ${totalImported} new rows (${totalSales} total)`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
