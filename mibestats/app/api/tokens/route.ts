import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tokenQuerySchema, parseSearchParams } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { magicEdenUrl } from '@/types'
import type { Prisma } from '@prisma/client'

export const revalidate = 86400   // 24-hour cache

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`tokens:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  const parsed = tokenQuerySchema.safeParse(
    parseSearchParams(Object.fromEntries(req.nextUrl.searchParams)),
  )
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const {
    archetype, ancestor, element, drug, hat, glasses, shirt,
    background, swag_rank, is_grail, sort, page, limit,
  } = parsed.data

  // Build Prisma where clause from active filters
  const where: Prisma.TokenWhereInput = {}
  if (archetype)  where.archetype  = archetype
  if (ancestor)   where.ancestor   = ancestor
  if (element)    where.element    = element
  if (drug)       where.drug       = drug
  if (hat)        where.hat        = hat
  if (glasses)    where.glasses    = glasses
  if (shirt)      where.shirt      = shirt
  if (background) where.background = background
  if (swag_rank)  where.swagRank   = swag_rank
  if (is_grail !== undefined) where.isGrail = is_grail

  // Sort order
  const orderBy: Prisma.TokenOrderByWithRelationInput =
    sort === 'swag_asc'   ? { swagScore: 'asc' }      :
    sort === 'id_asc'     ? { tokenId:   'asc' }       :
    sort === 'price_desc' ? { lastSalePrice: 'desc' }  :
    /* swag_desc default */ { swagScore: 'desc' }

  try {
    const [total, rows] = await Promise.all([
      prisma.token.count({ where }),
      prisma.token.findMany({
        where,
        orderBy,
        skip:  (page - 1) * limit,
        take:  limit,
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
    ])

    const data = rows.map((r) => ({
      ...r,
      lastSalePrice: r.lastSalePrice ? Number(r.lastSalePrice) : null,
      maxSalePrice:  r.maxSalePrice  ? Number(r.maxSalePrice)  : null,
      magicEdenUrl:  magicEdenUrl(r.tokenId),
    }))

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      hasNext: page * limit < total,
    })
  } catch (err) {
    console.error('[/api/tokens]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
