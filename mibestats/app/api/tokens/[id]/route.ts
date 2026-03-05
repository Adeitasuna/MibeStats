import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tokenIdSchema } from '@/lib/validation'
import { withRateLimit } from '@/lib/api-handler'
import { magicEdenUrl } from '@/types'

export const revalidate = 3600

export const GET = withRateLimit('token-detail', 100, async (req, { params }: { params: { id: string } }) => {
  const idParsed = tokenIdSchema.safeParse(params.id)
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid token ID (1–10000)' }, { status: 404 })
  }

  const tokenId = idParsed.data

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
}, { cacheSecs: 300 })
