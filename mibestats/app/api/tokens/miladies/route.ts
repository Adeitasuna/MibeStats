import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const revalidate = 86400

// IPFS CID for Milady stage images (phase 2 of reveal)
const MILADY_IPFS_CID = 'bafybeifatan2qtkwpmu7ymm3n6utapfepvcfcdanos5nmymzyohatdkfbm'

function miladyImageUrl(tokenId: number): string {
  return `https://${MILADY_IPFS_CID}.ipfs.dweb.link/${tokenId}.png`
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`miladies:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  const params = req.nextUrl.searchParams
  const search = (params.get('search')?.trim() ?? '').slice(0, 100)
  const page = Math.min(Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1), 1000)
  const limit = 200

  try {
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
          lastSalePrice: true,
          maxSalePrice: true,
        },
      }),
    ])

    const data = tokens.map((t) => ({
      tokenId: t.tokenId,
      miladyImageUrl: miladyImageUrl(t.tokenId),
      miberaImageUrl: t.imageUrl,
      swagRank: t.swagRank,
      isGrail: t.isGrail,
      grailName: t.grailName,
      ancestor: t.ancestor,
      archetype: t.archetype,
      lastSalePrice: t.lastSalePrice ? Number(t.lastSalePrice) : null,
      maxSalePrice: t.maxSalePrice ? Number(t.maxSalePrice) : null,
    }))

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[/api/tokens/miladies]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
