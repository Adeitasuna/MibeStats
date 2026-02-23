import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { toTraitCounts } from '@/lib/traits'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import type { TraitCount, TraitDistribution } from '@/types'

export const revalidate = 86400   // 24-hour cache — trait distribution is static

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`traits:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  try {
    const [
      archetypes, ancestors, elements, sunSigns, drugs,
      backgrounds, bodies, eyes, eyebrows, mouths, hairs, hats, glasses, shirts, swagRanks,
      grailRows,
    ] = await Promise.all([
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT archetype AS value, COUNT(*) AS count FROM tokens GROUP BY archetype`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT ancestor AS value, COUNT(*) AS count FROM tokens GROUP BY ancestor`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT element AS value, COUNT(*) AS count FROM tokens WHERE element IS NOT NULL GROUP BY element`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT sun_sign AS value, COUNT(*) AS count FROM tokens WHERE sun_sign IS NOT NULL GROUP BY sun_sign`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT drug AS value, COUNT(*) AS count FROM tokens WHERE drug IS NOT NULL GROUP BY drug`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT background AS value, COUNT(*) AS count FROM tokens WHERE background IS NOT NULL GROUP BY background`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT body AS value, COUNT(*) AS count FROM tokens WHERE body IS NOT NULL GROUP BY body`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT eyes AS value, COUNT(*) AS count FROM tokens WHERE eyes IS NOT NULL GROUP BY eyes`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT eyebrows AS value, COUNT(*) AS count FROM tokens WHERE eyebrows IS NOT NULL GROUP BY eyebrows`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT mouth AS value, COUNT(*) AS count FROM tokens WHERE mouth IS NOT NULL GROUP BY mouth`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT hair AS value, COUNT(*) AS count FROM tokens WHERE hair IS NOT NULL GROUP BY hair`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT hat AS value, COUNT(*) AS count FROM tokens WHERE hat IS NOT NULL GROUP BY hat`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT glasses AS value, COUNT(*) AS count FROM tokens WHERE glasses IS NOT NULL GROUP BY glasses`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT shirt AS value, COUNT(*) AS count FROM tokens WHERE shirt IS NOT NULL GROUP BY shirt`,
      prisma.$queryRaw<{ value: string | null; count: bigint }[]>`
        SELECT swag_rank AS value, COUNT(*) AS count FROM tokens GROUP BY swag_rank`,
      prisma.$queryRaw<{ grail_category: string | null; count: bigint }[]>`
        SELECT grail_category, COUNT(*) AS count FROM tokens WHERE is_grail = TRUE GROUP BY grail_category`,
    ])

    const grailCategories: TraitCount[] = grailRows
      .filter((r) => r.grail_category !== null)
      .map((r) => ({
        value: r.grail_category as string,
        count: Number(r.count),
        pct:   Math.round((Number(r.count) / 42) * 10000) / 100,
      }))

    const response: TraitDistribution = {
      archetypes:      toTraitCounts(archetypes),
      ancestors:       toTraitCounts(ancestors),
      elements:        toTraitCounts(elements),
      sunSigns:        toTraitCounts(sunSigns),
      drugs:           toTraitCounts(drugs),
      backgrounds:     toTraitCounts(backgrounds),
      bodies:          toTraitCounts(bodies),
      eyes:            toTraitCounts(eyes),
      eyebrows:        toTraitCounts(eyebrows),
      mouths:          toTraitCounts(mouths),
      hairs:           toTraitCounts(hairs),
      hats:            toTraitCounts(hats),
      glasses:         toTraitCounts(glasses),
      shirts:          toTraitCounts(shirts),
      swagRanks:       toTraitCounts(swagRanks),
      grailCategories,
      grailCount:      42,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/traits]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
