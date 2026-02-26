import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const revalidate = 86400

interface YearRow {
  birth_year: string
  era: string
  count: bigint
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`timeline:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  // Parse optional filters from query params
  const params = req.nextUrl.searchParams
  const timePeriod    = params.get('timePeriod')?.slice(0, 100)
  const moonSign      = params.get('moonSign')?.slice(0, 100)
  const sunSign       = params.get('sunSign')?.slice(0, 100)
  const element       = params.get('element')?.slice(0, 100)
  const archetype     = params.get('archetype')?.slice(0, 100)
  const ascendingSign = params.get('ascendingSign')?.slice(0, 100)

  try {
    // Build parameterized WHERE conditions
    const conditions: Prisma.Sql[] = [
      Prisma.sql`birthday IS NOT NULL AND birthday != ''`,
    ]
    if (timePeriod)    conditions.push(Prisma.sql`time_period = ${timePeriod}`)
    if (moonSign)      conditions.push(Prisma.sql`moon_sign = ${moonSign}`)
    if (sunSign)       conditions.push(Prisma.sql`sun_sign = ${sunSign}`)
    if (element)       conditions.push(Prisma.sql`element = ${element}`)
    if (archetype)     conditions.push(Prisma.sql`archetype = ${archetype}`)
    if (ascendingSign) conditions.push(Prisma.sql`ascending_sign = ${ascendingSign}`)

    const whereClause = Prisma.join(conditions, ' AND ')

    // Extract year from birthday field (format: "MM/DD/YYYY Ce/Bce HH:MM")
    const rows = await prisma.$queryRaw<YearRow[]>(
      Prisma.sql`
        SELECT
          SPLIT_PART(SPLIT_PART(birthday, '/', 3), ' ', 1) AS birth_year,
          CASE
            WHEN birthday LIKE '%Bce%' THEN 'BCE'
            ELSE 'CE'
          END AS era,
          COUNT(*) AS count
        FROM tokens
        WHERE ${whereClause}
        GROUP BY birth_year, era
        ORDER BY
          era DESC,
          CAST(SPLIT_PART(SPLIT_PART(birthday, '/', 3), ' ', 1) AS INTEGER) ASC
      `,
    )

    // Also get distinct values for filter dropdowns
    const [timePeriods, moonSigns, sunSigns, elements, archetypes, ascendingSigns] = await Promise.all([
      prisma.$queryRaw<{ value: string }[]>`SELECT DISTINCT time_period AS value FROM tokens ORDER BY time_period`,
      prisma.$queryRaw<{ value: string }[]>`SELECT DISTINCT moon_sign AS value FROM tokens WHERE moon_sign IS NOT NULL ORDER BY moon_sign`,
      prisma.$queryRaw<{ value: string }[]>`SELECT DISTINCT sun_sign AS value FROM tokens WHERE sun_sign IS NOT NULL ORDER BY sun_sign`,
      prisma.$queryRaw<{ value: string }[]>`SELECT DISTINCT element AS value FROM tokens WHERE element IS NOT NULL ORDER BY element`,
      prisma.$queryRaw<{ value: string }[]>`SELECT DISTINCT archetype AS value FROM tokens ORDER BY archetype`,
      prisma.$queryRaw<{ value: string }[]>`SELECT DISTINCT ascending_sign AS value FROM tokens WHERE ascending_sign IS NOT NULL ORDER BY ascending_sign`,
    ])

    return NextResponse.json({
      data: rows.map((r) => ({
        year: parseInt(r.birth_year, 10),
        era: r.era,
        count: Number(r.count),
        label: `${r.birth_year} ${r.era}`,
      })),
      filters: {
        timePeriods:    timePeriods.map((r) => r.value),
        moonSigns:      moonSigns.map((r) => r.value),
        sunSigns:       sunSigns.map((r) => r.value),
        elements:       elements.map((r) => r.value),
        archetypes:     archetypes.map((r) => r.value),
        ascendingSigns: ascendingSigns.map((r) => r.value),
      },
    })
  } catch (err) {
    console.error('[/api/tokens/timeline]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
