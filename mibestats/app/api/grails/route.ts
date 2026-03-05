import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/api-handler'
import { magicEdenUrl } from '@/types'

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
      lastSalePrice: true, maxSalePrice: true, saleCount: true,
    },
  })

  const mapped = grails.map((t: typeof grails[number]) => ({
    ...t,
    lastSalePrice: t.lastSalePrice ? Number(t.lastSalePrice) : null,
    maxSalePrice:  t.maxSalePrice  ? Number(t.maxSalePrice)  : null,
    magicEdenUrl:  magicEdenUrl(t.tokenId),
  }))

  // Group by grail_category
  const categories: Record<string, typeof mapped> = {}
  for (const g of mapped) {
    const cat = g.grailCategory ?? 'Unknown'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push(g)
  }

  return NextResponse.json({ total: grails.length, categories })
}, { cacheSecs: 3600 })
