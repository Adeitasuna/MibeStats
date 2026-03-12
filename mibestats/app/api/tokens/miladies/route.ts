import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/api-handler'

export const revalidate = 86400

const S3_BASE = 'https://thj-assets.s3.us-west-2.amazonaws.com'

function miladyImageUrl(tokenId: number): string {
  return `${S3_BASE}/fractures/miladies/images/${tokenId}.png`
}

export const GET = withRateLimit('miladies', 100, async (req) => {
  const params = req.nextUrl.searchParams
  const search = (params.get('search')?.trim() ?? '').slice(0, 100)
  const page = Math.min(Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1), 1000)
  const limit = 200

  // Build where clause for search
  const where: Record<string, unknown> = {}
  if (search) {
    const num = parseInt(search, 10)
    if (!isNaN(num) && num >= 1 && num <= 10000) {
      where.tokenId = num
    } else {
      // Search by grail name or ancestor
      where.OR = [
        { grailName: { contains: search, mode: 'insensitive' } },
        { ancestor: { contains: search, mode: 'insensitive' } },
        { archetype: { contains: search, mode: 'insensitive' } },
      ]
    }
  }

  const [total, tokens] = await Promise.all([
    prisma.token.count({ where }),
    prisma.token.findMany({
      where,
      orderBy: { tokenId: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        tokenId: true,
        imageUrl: true,
        swagRank: true,
        isGrail: true,
        grailName: true,
        ancestor: true,
        archetype: true,
        sales: {
          where: { priceBera: { gte: 5 } },
          orderBy: { soldAt: 'desc' },
          select: { priceBera: true },
        },
      },
    }),
  ])

  const data = tokens.map((t) => {
    const realSales = t.sales.map((s) => Number(s.priceBera))
    return {
      tokenId: t.tokenId,
      miladyImageUrl: miladyImageUrl(t.tokenId),
      miberaImageUrl: t.imageUrl,
      swagRank: t.swagRank,
      isGrail: t.isGrail,
      grailName: t.grailName,
      ancestor: t.ancestor,
      archetype: t.archetype,
      lastSalePrice: realSales.length > 0 ? realSales[0] : null,
      maxSalePrice: realSales.length > 0 ? Math.max(...realSales) : null,
    }
  })

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    hasNext: page * limit < total,
    totalPages: Math.ceil(total / limit),
  })
}, { cacheSecs: 300 })
