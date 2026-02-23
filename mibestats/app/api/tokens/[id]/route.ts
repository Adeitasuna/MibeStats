import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tokenIdSchema } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { magicEdenUrl } from '@/types'

export const revalidate = 3600

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`token-detail:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  const idParsed = tokenIdSchema.safeParse(params.id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid token ID (1–10000)' }, { status: 404 })
  }

  const tokenId = idParsed.data

  try {
    const token = await prisma.token.findUnique({
      where: { tokenId },
      include: {
        sales: {
          orderBy: { soldAt: 'desc' },
          take:    50,
          select: {
            id: true, priceBera: true, priceUsd: true, soldAt: true,
            buyerAddress: true, sellerAddress: true, txHash: true, marketplace: true,
          },
        },
      },
    })

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    const response = {
      ...token,
      lastSalePrice: token.lastSalePrice ? Number(token.lastSalePrice) : null,
      maxSalePrice:  token.maxSalePrice  ? Number(token.maxSalePrice)  : null,
      magicEdenUrl:  magicEdenUrl(token.tokenId),
      salesHistory:  token.sales.map((s) => ({
        id:            String(s.id),
        priceBera:     Number(s.priceBera),
        priceUsd:      s.priceUsd ? Number(s.priceUsd) : null,
        soldAt:        s.soldAt.toISOString(),
        buyerAddress:  s.buyerAddress,
        sellerAddress: s.sellerAddress,
        txHash:        s.txHash,
        marketplace:   s.marketplace,
      })),
    }

    // Remove the raw `sales` relation to avoid duplication
    const { sales: _sales, ...rest } = response
    void _sales

    return NextResponse.json(rest)
  } catch (err) {
    console.error('[/api/tokens/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
