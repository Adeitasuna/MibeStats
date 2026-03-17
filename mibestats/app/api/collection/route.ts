import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFloorPriceFromBestSource } from '@/lib/floor-price'
import { withRateLimit } from '@/lib/api-handler'
import type { CollectionResponse, Sale } from '@/types'
import { openSeaUrl } from '@/types'

export const revalidate = 300   // 5-minute ISR cache

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dead'
const MIN_SALE_PRICE = 5  // filter dust/test trades

export const GET = withRateLimit('collection', 100, async (req) => {
  const now = Date.now()

  // Fetch floor price from best available source (OpenSea → ME → DB fallback)
  const floorResult = await getFloorPriceFromBestSource()
  const floorPrice = floorResult.floorPrice

  // Compute all stats from DB in parallel
  // Single query for all volume stats (4 aggregates → 1)
  const volStats = await prisma.$queryRaw<[{
    vol_1d: string | null; vol_7d: string | null; vol_30d: string | null; vol_all: string | null; sale_count: bigint
  }]>`
    SELECT
      SUM(CASE WHEN sold_at >= ${new Date(now - 24 * 60 * 60 * 1000)} AND price_bera >= ${MIN_SALE_PRICE} THEN price_bera END)::text AS vol_1d,
      SUM(CASE WHEN sold_at >= ${new Date(now - 7 * 24 * 60 * 60 * 1000)} AND price_bera >= ${MIN_SALE_PRICE} THEN price_bera END)::text AS vol_7d,
      SUM(CASE WHEN sold_at >= ${new Date(now - 30 * 24 * 60 * 60 * 1000)} AND price_bera >= ${MIN_SALE_PRICE} THEN price_bera END)::text AS vol_30d,
      SUM(CASE WHEN price_bera >= ${MIN_SALE_PRICE} THEN price_bera END)::text AS vol_all,
      COUNT(CASE WHEN price_bera >= ${MIN_SALE_PRICE} THEN 1 END) AS sale_count
    FROM sales
  `

  const [
    totalHolders,
    recentRows, topRows,
  ] = await Promise.all([
    // Total holders (distinct non-burned owner addresses)
    prisma.token.count({
      where: {
        ownerAddress: { notIn: [ZERO_ADDRESS, DEAD_ADDRESS] },
      },
    }),
    // Recent sales
    prisma.sale.findMany({
      where:   { priceBera: { gte: MIN_SALE_PRICE } },
      orderBy: { soldAt: 'desc' },
      take:    20,
      include: { token: { select: { tokenId: true, imageUrl: true, swagRank: true, isGrail: true } } },
    }),
    // Top sales
    prisma.sale.findMany({
      where:   { priceBera: { gte: MIN_SALE_PRICE } },
      orderBy: { priceBera: 'desc' },
      take:    10,
      include: { token: { select: { tokenId: true, imageUrl: true, swagRank: true, isGrail: true } } },
    }),
  ])

  const vs = volStats[0]
  const volume24h = vs.vol_1d ? Number(vs.vol_1d) : null
  const volume7d = vs.vol_7d ? Number(vs.vol_7d) : null
  const volume30d = vs.vol_30d ? Number(vs.vol_30d) : null
  const volumeAllTime = vs.vol_all ? Number(vs.vol_all) : null
  const totalSales = Number(vs.sale_count)

  // Update collection_stats cache + floor price snapshot
  await prisma.collectionStats.upsert({
    where:  { id: 1 },
    update: {
      floorPrice:    floorPrice != null ? String(floorPrice) : null,
      volume24h:     volume24h != null ? String(volume24h) : null,
      volume7d:      volume7d != null ? String(volume7d) : null,
      volume30d:     volume30d != null ? String(volume30d) : null,
      volumeAllTime: volumeAllTime != null ? String(volumeAllTime) : null,
      totalSales:    totalSales,
      totalHolders:  totalHolders,
    },
    create: {
      id:            1,
      floorPrice:    floorPrice != null ? String(floorPrice) : null,
      volume24h:     volume24h != null ? String(volume24h) : null,
      volume7d:      volume7d != null ? String(volume7d) : null,
      volume30d:     volume30d != null ? String(volume30d) : null,
      volumeAllTime: volumeAllTime != null ? String(volumeAllTime) : null,
      totalSales:    totalSales,
      totalHolders:  totalHolders,
    },
  })

  // Record daily floor snapshot
  if (floorPrice != null) {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    await prisma.floorPriceHistory.upsert({
      where:  { recordedAt: today },
      update: { floorPrice: String(floorPrice) },
      create: { floorPrice: String(floorPrice), recordedAt: today },
    }).catch(() => {/* ignore unique constraint race */})
  }

  const toSale = (row: typeof recentRows[0]): Sale => ({
    id:            String(row.id),
    tokenId:       row.tokenId,
    priceBera:     Number(row.priceBera),
    priceUsd:      row.priceUsd ? Number(row.priceUsd) : null,
    soldAt:        row.soldAt.toISOString(),
    buyerAddress:  row.buyerAddress,
    sellerAddress: row.sellerAddress,
    txHash:        row.txHash,
    marketplace:   row.marketplace,
    token: row.token
      ? {
          tokenId:  row.token.tokenId,
          imageUrl: row.token.imageUrl,
          swagRank: row.token.swagRank as Sale['token'] extends { swagRank: infer R } ? R : never,
          isGrail:  row.token.isGrail,
        }
      : undefined,
  })

  const response = {
    floorPrice,
    floorPriceSource: floorResult.source,
    floorPriceAsOf: floorResult.asOf,
    volume24h,
    volume7d,
    volume30d,
    volumeAllTime,
    totalSales,
    totalHolders,
    updatedAt: new Date().toISOString(),
    recentSales: recentRows.map(toSale),
    topSales:    topRows.map(toSale),
  } satisfies CollectionResponse & { floorPriceSource: string; floorPriceAsOf: string }

  return NextResponse.json(response)
}, { cacheSecs: 300 })
