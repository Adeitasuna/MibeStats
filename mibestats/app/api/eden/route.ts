import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { magicEdenUrl } from '@/types'

export const revalidate = 900

interface SaleCountBucket { sale_count: number; token_count: bigint }
interface TopSoldRow {
  token_id: number; sale_count: number; transfer_count: number; image_url: string | null
  swag_rank: string; is_grail: boolean; grail_name: string | null
  max_sale_price: string | null; last_sale_price: string | null
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`eden:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  try {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
    const DEAD_ADDRESS = '0x000000000000000000000000000000000000dead'

    const [
      bestSales, salesDistribution, mostSold,
      salesCount1d, salesCount7d, totalSales,
      vol1d, vol7d, volAll, daySales,
      grailCount, totalTokens, burnedCount,
    ] = await Promise.all([
      // Best sales top 30
      prisma.sale.findMany({
        orderBy: { priceBera: 'desc' },
        take: 30,
        include: {
          token: {
            select: {
              tokenId: true, imageUrl: true, swagRank: true,
              isGrail: true, grailName: true,
            },
          },
        },
      }),

      // Sales distribution: how many tokens have 0, 1, 2, 3... sales
      prisma.$queryRaw<SaleCountBucket[]>`
        SELECT sale_count, COUNT(*) AS token_count
        FROM tokens
        GROUP BY sale_count
        ORDER BY sale_count ASC
      `,

      // Most sold miberas (top 30 by sale count)
      prisma.$queryRaw<TopSoldRow[]>`
        SELECT token_id, sale_count, transfer_count, image_url, swag_rank, is_grail,
               grail_name, max_sale_price::text, last_sale_price::text
        FROM tokens
        WHERE sale_count > 0
        ORDER BY sale_count DESC, token_id ASC
        LIMIT 30
      `,

      // Sales count 1d
      prisma.sale.count({
        where: { soldAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),

      // Sales count 7d
      prisma.sale.count({
        where: { soldAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),

      // Total sales count
      prisma.sale.count(),

      // Volume 1d
      prisma.sale.aggregate({
        _sum: { priceBera: true },
        where: { soldAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),

      // Volume 7d
      prisma.sale.aggregate({
        _sum: { priceBera: true },
        where: { soldAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),

      // Volume all-time
      prisma.sale.aggregate({
        _sum: { priceBera: true },
      }),

      // Last 24h lowest and highest sale (>= 5 BERA to exclude false WBERA detections)
      prisma.sale.aggregate({
        _min: { priceBera: true },
        _max: { priceBera: true },
        where: { soldAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, priceBera: { gte: 5 } },
      }),

      // Grail count from DB
      prisma.token.count({ where: { isGrail: true } }),

      // Total token count
      prisma.token.count(),

      // Burned tokens (sent to zero or dead address)
      prisma.token.count({
        where: { ownerAddress: { in: [ZERO_ADDRESS, DEAD_ADDRESS] } },
      }),
    ])

    return NextResponse.json({
      bestSales: bestSales.map((s) => ({
        id: String(s.id),
        tokenId: s.tokenId,
        priceBera: Number(s.priceBera),
        soldAt: s.soldAt.toISOString(),
        imageUrl: s.token?.imageUrl ?? null,
        swagRank: s.token?.swagRank ?? null,
        isGrail: s.token?.isGrail ?? false,
        grailName: s.token?.grailName ?? null,
        magicEdenUrl: magicEdenUrl(s.tokenId),
      })),
      salesDistribution: salesDistribution.map((r) => ({
        saleCount: r.sale_count,
        tokenCount: Number(r.token_count),
      })),
      mostSold: mostSold.map((r) => ({
        tokenId: r.token_id,
        saleCount: r.sale_count,
        transferCount: r.transfer_count,
        imageUrl: r.image_url,
        swagRank: r.swag_rank,
        isGrail: r.is_grail,
        grailName: r.grail_name,
        maxSalePrice: r.max_sale_price ? Number(r.max_sale_price) : null,
        lastSalePrice: r.last_sale_price ? Number(r.last_sale_price) : null,
        magicEdenUrl: magicEdenUrl(r.token_id),
      })),
      salesStats: {
        count1d: salesCount1d,
        count7d: salesCount7d,
        countAll: totalSales,
        volume1d: vol1d._sum.priceBera ? Number(vol1d._sum.priceBera) : 0,
        volume7d: vol7d._sum.priceBera ? Number(vol7d._sum.priceBera) : 0,
        volumeAll: volAll._sum.priceBera ? Number(volAll._sum.priceBera) : 0,
        lowestSale24h: daySales._min.priceBera ? Number(daySales._min.priceBera) : null,
        highestSale24h: daySales._max.priceBera ? Number(daySales._max.priceBera) : null,
      },
      grailStats: {
        grails: grailCount,
        nonGrails: totalTokens - grailCount - burnedCount,
        burned: burnedCount,
      },
    })
  } catch (err) {
    console.error('[/api/eden]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
