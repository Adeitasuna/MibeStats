import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const revalidate = 86400

interface MapRow {
  token_id: number
  birth_coordinates: string
  ancestor: string
  archetype: string
  element: string | null
  time_period: string
  swag_rank: string
  is_grail: boolean
  sun_sign: string | null
  moon_sign: string | null
  ascending_sign: string | null
}

const COLUMN_MAP: Record<string, string> = {
  ancestor: 'ancestor', archetype: 'archetype', element: 'element',
  timePeriod: 'time_period', swagRank: 'swag_rank',
  sunSign: 'sun_sign', moonSign: 'moon_sign', ascendingSign: 'ascending_sign',
  drug: 'drug', background: 'background', body: 'body', eyes: 'eyes',
  hair: 'hair', hat: 'hat', glasses: 'glasses', shirt: 'shirt',
  mask: 'mask', earrings: 'earrings', tattoo: 'tattoo', item: 'item',
}

const FILTER_KEYS = Object.keys(COLUMN_MAP)

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`map:${ip}`, 30, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  // Parse optional filters
  const params = req.nextUrl.searchParams
  const filters: Record<string, string> = {}
  for (const key of FILTER_KEYS) {
    const val = params.get(key)?.slice(0, 100)
    if (val) filters[key] = val
  }

  try {
    // Build parameterized WHERE conditions
    const conditions: Prisma.Sql[] = [
      Prisma.sql`birth_coordinates IS NOT NULL AND birth_coordinates != ''`,
    ]

    for (const [key, val] of Object.entries(filters)) {
      const col = COLUMN_MAP[key]
      if (col) {
        conditions.push(Prisma.sql`${Prisma.raw(`"${col}"`)} = ${val}`)
      }
    }

    const whereClause = Prisma.join(conditions, ' AND ')

    const rows = await prisma.$queryRaw<MapRow[]>(
      Prisma.sql`
        SELECT token_id, birth_coordinates, ancestor, archetype, element,
               time_period, swag_rank, is_grail, sun_sign, moon_sign, ascending_sign
        FROM tokens
        WHERE ${whereClause}
      `,
    )

    // Parse coordinates and build response
    const points = rows
      .map((r) => {
        const coords = r.birth_coordinates.split(',').map((s) => parseFloat(s.trim()))
        if (coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) return null
        return {
          id: r.token_id,
          lat: coords[0],
          lng: coords[1],
          ancestor: r.ancestor,
          archetype: r.archetype,
          element: r.element,
          timePeriod: r.time_period,
          swagRank: r.swag_rank,
          sunSign: r.sun_sign,
          moonSign: r.moon_sign,
          ascendingSign: r.ascending_sign,
          isGrail: r.is_grail,
        }
      })
      .filter(Boolean)

    // Get distinct ancestors for legend
    const ancestors = Array.from(new Set(rows.map((r) => r.ancestor))).sort()

    return NextResponse.json({
      points,
      total: points.length,
      ancestors,
    })
  } catch (err) {
    console.error('[/api/tokens/map]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
