/**
 * snapshot-floor.ts — Record daily floor price.
 * Fetches floor price from OpenSea, skips if unavailable.
 * Run by GitHub Actions cron after sales sync.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getFloorPriceFromBestSource } from '../lib/floor-price'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Floor price snapshot ===')

  const result = await getFloorPriceFromBestSource()
  const floorPrice = result.floorPrice

  if (floorPrice == null || result.source === 'database') {
    console.log(`No live floor price available (source: ${result.source})`)
    return
  }

  console.log(`Source: ${result.source}`)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await prisma.floorPriceHistory.upsert({
    where:  { recordedAt: today },
    update: { floorPrice: String(floorPrice) },
    create: { floorPrice: String(floorPrice), recordedAt: today },
  })

  console.log(`Floor snapshot recorded: ${floorPrice} BERA (${today.toISOString().slice(0, 10)})`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
