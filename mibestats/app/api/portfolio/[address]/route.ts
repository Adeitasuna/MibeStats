import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addressSchema } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { magicEdenUrl } from '@/types'

export const revalidate = 60   // 1-minute ISR

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } },
) {
  // ─── Rate limiting: 30 req/min per IP ──────────────────────────────────────
  const ip = getClientIp(req)
  const rl = checkRateLimit(ip, 30, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After':         String(Math.ceil((rl.resetMs - Date.now()) / 1000)),
          'X-RateLimit-Limit':   '30',
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  // ─── Address validation ─────────────────────────────────────────────────────
  const parsed = addressSchema.safeParse(params.address)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid EIP-55 checksummed address' },
      { status: 400 },
    )
  }

  const address = parsed.data

  try {
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
          lastSalePrice: true, maxSalePrice: true, saleCount: true,
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
      magicEdenUrl:  magicEdenUrl(t.tokenId),
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
  } catch (err) {
    console.error('[/api/portfolio]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
