import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCollectionStats } from '@/lib/me-api'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import type { CollectionResponse, Sale } from '@/types'
import { magicEdenUrl } from '@/types'

export const revalidate = 300   // 5-minute ISR cache

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`collection:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  try {
    // Fetch fresh stats from ME and update DB cache
    let stats
    try {
      stats = await getCollectionStats()

      // Upsert collection_stats singleton
      await prisma.collectionStats.upsert({
        where:  { id: 1 },
        update: {
          floorPrice:    stats.floorPrice    ? String(stats.floorPrice)    : null,
          volume24h:     stats.volume24h     ? String(stats.volume24h)     : null,
          volume7d:      stats.volume7d      ? String(stats.volume7d)      : null,
          volume30d:     stats.volume30d     ? String(stats.volume30d)     : null,
          volumeAllTime: stats.volumeAllTime ? String(stats.volumeAllTime) : null,
          totalSales:    stats.totalSales,
          totalHolders:  stats.totalHolders,
        },
        create: {
          id:            1,
          floorPrice:    stats.floorPrice    ? String(stats.floorPrice)    : null,
          volume24h:     stats.volume24h     ? String(stats.volume24h)     : null,
          volume7d:      stats.volume7d      ? String(stats.volume7d)      : null,
          volume30d:     stats.volume30d     ? String(stats.volume30d)     : null,
          volumeAllTime: stats.volumeAllTime ? String(stats.volumeAllTime) : null,
          totalSales:    stats.totalSales,
          totalHolders:  stats.totalHolders,
        },
      })

      // Record daily floor snapshot (idempotent — unique on date)
      if (stats.floorPrice !== null) {
        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)
        await prisma.floorPriceHistory.upsert({
          where:  { recordedAt: today },
          update: { floorPrice: String(stats.floorPrice) },
          create: { floorPrice: String(stats.floorPrice), recordedAt: today },
        }).catch(() => {/* ignore unique constraint race */})
      }
    } catch {
      // ME API unavailable — fall back to cached DB values
      const cached = await prisma.collectionStats.findUnique({ where: { id: 1 } })
      if (!cached) {
        return NextResponse.json({ error: 'Data unavailable' }, { status: 503 })
      }
      stats = {
        floorPrice:    cached.floorPrice    ? Number(cached.floorPrice)    : null,
        volume24h:     cached.volume24h     ? Number(cached.volume24h)     : null,
        volume7d:      cached.volume7d      ? Number(cached.volume7d)      : null,
        volume30d:     cached.volume30d     ? Number(cached.volume30d)     : null,
        volumeAllTime: cached.volumeAllTime ? Number(cached.volumeAllTime) : null,
        totalSales:    cached.totalSales,
        totalHolders:  cached.totalHolders,
      }
    }

    // Fetch recent + top sales in parallel
    const [recentRows, topRows, cached] = await Promise.all([
      prisma.sale.findMany({
        orderBy: { soldAt: 'desc' },
        take:    20,
        include: { token: { select: { tokenId: true, imageUrl: true, swagRank: true, isGrail: true } } },
      }),
      prisma.sale.findMany({
        orderBy: { priceBera: 'desc' },
        take:    10,
        include: { token: { select: { tokenId: true, imageUrl: true, swagRank: true, isGrail: true } } },
      }),
      prisma.collectionStats.findUnique({ where: { id: 1 } }),
    ])

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
      floorPrice:    stats.floorPrice,
      volume24h:     stats.volume24h,
      volume7d:      stats.volume7d,
      volume30d:     stats.volume30d,
      volumeAllTime: stats.volumeAllTime,
      totalSales:    stats.totalSales,
      totalHolders:  stats.totalHolders,
      updatedAt:     cached?.updatedAt.toISOString() ?? new Date().toISOString(),
      recentSales:   recentRows.map(toSale),
      topSales:      topRows.map(toSale),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/collection]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
