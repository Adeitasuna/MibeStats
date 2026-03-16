import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  const now = new Date()

  const [sc, tc, ls, ss, fc, lf, cs, s1d, s7d, s30d] = await Promise.all([
    p.sale.count(),
    p.token.count(),
    p.sale.findFirst({ orderBy: { soldAt: 'desc' }, select: { soldAt: true, marketplace: true, priceBera: true, tokenId: true } }),
    p.syncState.findMany(),
    p.floorPriceHistory.count(),
    p.floorPriceHistory.findFirst({ orderBy: { recordedAt: 'desc' }, select: { recordedAt: true, floorPrice: true } }),
    p.collectionStats.findUnique({ where: { id: 1 } }),
    p.sale.count({ where: { soldAt: { gte: new Date(now.getTime() - 24 * 3600000) } } }),
    p.sale.count({ where: { soldAt: { gte: new Date(now.getTime() - 7 * 24 * 3600000) } } }),
    p.sale.count({ where: { soldAt: { gte: new Date(now.getTime() - 30 * 24 * 3600000) } } }),
  ])

  // Marketplace breakdown
  const byMarketplace = await p.sale.groupBy({ by: ['marketplace'], _count: true, orderBy: { _count: { marketplace: 'desc' } } })

  console.log('=== DB STATUS ===')
  console.log('Sales total:', sc)
  console.log('Tokens total:', tc)
  console.log('')

  if (ls) {
    const hours = (now.getTime() - ls.soldAt.getTime()) / 3600000
    console.log('Last sale:', ls.soldAt.toISOString(), '|', ls.marketplace, '|', Number(ls.priceBera).toFixed(2), 'BERA | #' + ls.tokenId)
    console.log('  -> age:', hours.toFixed(1), 'hours ago')
  }
  console.log('')

  console.log('Sales by marketplace:')
  for (const m of byMarketplace) console.log(' ', m.marketplace, ':', m._count)
  console.log('')

  console.log('Sales last 24h:', s1d)
  console.log('Sales last 7d:', s7d)
  console.log('Sales last 30d:', s30d)
  console.log('')

  console.log('Sync checkpoints:')
  for (const s of ss) console.log(' ', s.key, '=', s.value)
  console.log('')

  console.log('Floor snapshots:', fc)
  if (lf) {
    const days = (now.getTime() - lf.recordedAt.getTime()) / 86400000
    console.log('Last floor:', lf.recordedAt.toISOString().slice(0, 10), '=', Number(lf.floorPrice).toFixed(4), 'BERA')
    console.log('  -> age:', days.toFixed(1), 'days ago')
  }
  console.log('')

  if (cs) {
    console.log('Collection stats updated:', cs.updatedAt.toISOString())
    console.log('  floor:', cs.floorPrice ? Number(cs.floorPrice).toFixed(4) : 'null')
    console.log('  vol24h:', cs.volume24h ? Number(cs.volume24h).toFixed(1) : 'null')
    console.log('  vol7d:', cs.volume7d ? Number(cs.volume7d).toFixed(1) : 'null')
    console.log('  vol30d:', cs.volume30d ? Number(cs.volume30d).toFixed(1) : 'null')
  }
}

main().catch(console.error).finally(() => p.$disconnect())
