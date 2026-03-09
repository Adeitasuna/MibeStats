import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { salesQuerySchema, parseSearchParams } from '@/lib/validation'
import { withRateLimit } from '@/lib/api-handler'
import type { Prisma } from '@prisma/client'

export const revalidate = 3600

export const GET = withRateLimit('sales', 100, async (req) => {
  const parsed = salesQuerySchema.safeParse(
    parseSearchParams(Object.fromEntries(req.nextUrl.searchParams)),
  )
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const { token_id, min_price, max_price, from_date, to_date, is_grail, page, limit } =
    parsed.data

  const where: Prisma.SaleWhereInput = {
    ...(token_id !== undefined && { tokenId: token_id }),
    ...(is_grail !== undefined && { token: { isGrail: is_grail } }),
    ...((min_price !== undefined || max_price !== undefined) && {
      priceBera: {
        ...(min_price !== undefined && { gte: min_price }),
        ...(max_price !== undefined && { lte: max_price }),
      },
    }),
    ...((from_date !== undefined || to_date !== undefined) && {
      soldAt: {
        ...(from_date !== undefined && { gte: new Date(from_date) }),
        ...(to_date !== undefined   && { lte: new Date(to_date)   }),
      },
    }),
  }

  const [total, rows] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      orderBy: { soldAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      select: {
        id:            true,
        tokenId:       true,
        priceBera:     true,
        priceUsd:      true,
        soldAt:        true,
        buyerAddress:  true,
        sellerAddress: true,
        txHash:        true,
        marketplace:   true,
        token: {
          select: {
            tokenId:  true,
            imageUrl: true,
            swagRank: true,
            isGrail:  true,
          },
        },
      },
    }),
  ])

  const data = rows.map((r) => ({
    id:            String(r.id),
    tokenId:       r.tokenId,
    priceBera:     Number(r.priceBera),
    priceUsd:      r.priceUsd ? Number(r.priceUsd) : null,
    soldAt:        r.soldAt.toISOString(),
    buyerAddress:  r.buyerAddress,
    sellerAddress: r.sellerAddress,
    txHash:        r.txHash,
    marketplace:   r.marketplace,
    token:         r.token ?? undefined,
  }))

  return NextResponse.json({ data, total, page, limit, hasNext: page * limit < total })
}, { cacheSecs: 60 })
