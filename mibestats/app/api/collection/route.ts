import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getFloorPrice } from '@/lib/me-api'
import { withRateLimit } from '@/lib/api-handler'
import type { CollectionResponse, Sale } from '@/types'
import { magicEdenUrl } from '@/types'

export const revalidate = 300   // 5-minute ISR cache

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dead'
const MIN_SALE_PRICE = 5  // filter dust/test trades

export const GET = withRateLimit('collection', 100, async (req) => {
  const now = Date.now()

  // Fetch floor price from ME API (only thing we still need ME for)
  let floorPrice: number | null = null
  try {
    floorPrice = await getFloorPrice()
  } catch {
    // ME API unavailable — fall back to cached value
    const cached = await prisma.collectionStats.findUnique({ where: { id: 1 } })
    floorPrice = cached?.floorPrice ? Number(cached.floorPrice) : null
  }

  // Compute all stats from DB in parallel
  const [
    vol24, vol7d, vol30d, volAll,
    totalSales, totalHolders,
    recentRows, topRows,
  ] = await Promise.all([
    // Volume 24h
    prisma.sale.aggregate({
      _sum: { priceBera: true },
      where: { soldAt: { gte: new Date(now - 24 * 60 * 60 * 1000) }, priceBera: { gte: MIN_SALE_PRICE } },
    }),
    // Volume 7d
    prisma.sale.aggregate({
      _sum: { priceBera: true },
      where: { soldAt: { gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }, priceBera: { gte: MIN_SALE_PRICE } },
    }),
    // Volume 30d
    prisma.sale.aggregate({
      _sum: { priceBera: true },
      where: { soldAt: { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }, priceBera: { gte: MIN_SALE_PRICE } },
    }),
    // Volume all-time
    prisma.sale.aggregate({
      _sum: { priceBera: true },
      where: { priceBera: { gte: MIN_SALE_PRICE } },
    }),
    // Total real sales
    prisma.sale.count({
      where: { priceBera: { gte: MIN_SALE_PRICE } },
    }),
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

  const volume24h = vol24._sum.priceBera ? Number(vol24._sum.priceBera) : null
  const volume7d = vol7d._sum.priceBera ? Number(vol7d._sum.priceBera) : null
  const volume30d = vol30d._sum.priceBera ? Number(vol30d._sum.priceBera) : null
  const volumeAllTime = volAll._sum.priceBera ? Number(volAll._sum.priceBera) : null

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

  const response: CollectionResponse = {
    floorPrice,
    volume24h,
    volume7d,
    volume30d,
    volumeAllTime,
    totalSales,
    totalHolders,
    updatedAt: new Date().toISOString(),
    recentSales: recentRows.map(toSale),
    topSales:    topRows.map(toSale),
  }

  return NextResponse.json(response)
}, { cacheSecs: 300 })
