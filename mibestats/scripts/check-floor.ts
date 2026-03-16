import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getFloorPrice } from '../lib/me-api'

const p = new PrismaClient()

async function main() {
  // Current ME floor
  let meFloor: number | null = null
  try {
    meFloor = await getFloorPrice()
    console.log('ME API floor price NOW:', meFloor, 'BERA')
  } catch (e) {
    console.log('ME API error:', e instanceof Error ? e.message : e)
  }

  // Cached stats
  const cs = await p.collectionStats.findUnique({ where: { id: 1 } })
  console.log('')
  console.log('Cached floor:', cs?.floorPrice ? Number(cs.floorPrice).toFixed(4) : 'null')
  console.log('Cached updated:', cs?.updatedAt?.toISOString() ?? 'never')

  // Floor history
  const floors = await p.floorPriceHistory.findMany({ orderBy: { recordedAt: 'desc' }, take: 15 })
  console.log('')
  console.log('Floor price history (last 15):')
  for (const f of floors) console.log(' ', f.recordedAt.toISOString().slice(0, 10), '=', Number(f.floorPrice).toFixed(4), 'BERA')

  // What does the dashboard actually show?
  // The "Floor Price" card reads from /api/collection -> collection?.floorPrice
  // The chart reads from /api/stats/floor-history
  console.log('')
  console.log('Dashboard "Floor Price" card shows:', cs?.floorPrice ? Number(cs.floorPrice).toFixed(4) : 'null', '(cached, outdated)')
  if (meFloor) console.log('After fix, it would show:', meFloor.toFixed(4), '(live from ME)')
}

main().catch(console.error).finally(() => p.$disconnect())
