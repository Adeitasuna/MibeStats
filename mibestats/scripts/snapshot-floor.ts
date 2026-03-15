/**
 * snapshot-floor.ts — Record daily floor price from Magic Eden.
 * Run by GitHub Actions cron after sales sync.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getFloorPrice } from '../lib/me-api'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Floor price snapshot ===')

  const floorPrice = await getFloorPrice()

  if (floorPrice == null) {
    console.log('No floor price available from ME API')
    return
  }

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
