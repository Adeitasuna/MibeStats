import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/api-handler'
import { openSeaUrl } from '@/types'

export const revalidate = 86400

export const GET = withRateLimit('grails', 100, async (req) => {
  const grails = await prisma.token.findMany({
    where:   { isGrail: true },
    orderBy: [{ grailCategory: 'asc' }, { tokenId: 'asc' }],
    select: {
      tokenId: true, archetype: true, ancestor: true, timePeriod: true,
      element: true, sunSign: true, moonSign: true, ascendingSign: true,
      swagScore: true, swagRank: true, rarityRank: true,
      background: true, body: true, eyes: true, eyebrows: true,
      mouth: true, hair: true, shirt: true, hat: true, glasses: true,
      mask: true, earrings: true, faceAccessory: true, tattoo: true,
      item: true, drug: true,
      isGrail: true, grailName: true, grailCategory: true,
      imageUrl: true, ownerAddress: true,
      saleCount: true,
      sales: {
        where: { priceBera: { gte: 5 } },
        orderBy: { soldAt: 'desc' },
        select: { priceBera: true },
      },
    },
  })

  const mapped = grails.map((t: typeof grails[number]) => {
    const realSales = t.sales.map((s) => Number(s.priceBera))
    const lastSalePrice = realSales.length > 0 ? realSales[0] : null
    const maxSalePrice = realSales.length > 0 ? Math.max(...realSales) : null
    const { sales: _sales, ...rest } = t
    void _sales
    return {
      ...rest,
      lastSalePrice,
      maxSalePrice,
      openSeaUrl: openSeaUrl(t.tokenId),
    }
  })

  // Group by grail_category
  const categories: Record<string, typeof mapped> = {}
  for (const g of mapped) {
    const cat = g.grailCategory ?? 'Unknown'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(g)
  }

  return NextResponse.json({ total: grails.length, categories })
}, { cacheSecs: 3600 })
