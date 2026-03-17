import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addressSchema } from '@/lib/validation'
import { withRateLimit } from '@/lib/api-handler'
import { apiError } from '@/lib/api-error'
import { openSeaUrl } from '@/types'

export const revalidate = 60   // 1-minute ISR

export const GET = withRateLimit('portfolio', 30, async (req, { params }: { params: { address: string } }) => {
  // ─── Address validation ─────────────────────────────────────────────────────
  const parsed = addressSchema.safeParse(params.address)
  if (!parsed.success) {
    return apiError('Invalid EIP-55 checksummed address', 400)
  }

  const address = parsed.data

  const [tokens, collectionStats] = await Promise.all([
    prisma.token.findMany({
      where:   { ownerAddress: address },
      orderBy: { rarityRank: 'asc' },
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
        lastSalePrice: true, maxSalePrice: true, saleCount: true, transferCount: true,
      },
    }),
    prisma.collectionStats.findUnique({ where: { id: 1 } }),
  ])

  const count      = tokens.length
  const floorPrice = collectionStats?.floorPrice ? Number(collectionStats.floorPrice) : null

  const mappedTokens = tokens.map((t) => ({
    ...t,
    lastSalePrice: t.lastSalePrice ? Number(t.lastSalePrice) : null,
    maxSalePrice:  t.maxSalePrice  ? Number(t.maxSalePrice)  : null,
    openSeaUrl:    openSeaUrl(t.tokenId),
  }))

  const grailCount       = tokens.filter((t) => t.isGrail).length
  const estimatedValue   = floorPrice != null ? count * floorPrice : null
  const avgRarityRank    = count > 0
    ? Math.round(tokens.reduce((s, t) => s + (t.rarityRank ?? 10000), 0) / count)
    : null
  const highestSwagScore = count > 0
    ? Math.max(...tokens.map((t) => t.swagScore))
    : null

  return NextResponse.json({
    address,
    tokens: mappedTokens,
    stats: { count, estimatedValue, avgRarityRank, highestSwagScore, grailCount },
  })
}, { cacheSecs: 60 })
