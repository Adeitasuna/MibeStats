import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import type { TraitCount, TraitDistribution } from '@/types'

export const revalidate = 86400   // 24-hour cache — trait distribution is static

interface TraitRow { category: string; value: string | null; count: bigint }

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
    // Single query with UNION ALL — avoids exhausting connection pool
    const rows = await prisma.$queryRaw<TraitRow[]>`
      SELECT 'archetype' AS category, archetype AS value, COUNT(*) AS count FROM tokens GROUP BY archetype
      UNION ALL SELECT 'ancestor', ancestor, COUNT(*) FROM tokens GROUP BY ancestor
      UNION ALL SELECT 'element', element, COUNT(*) FROM tokens WHERE element IS NOT NULL GROUP BY element
      UNION ALL SELECT 'sunSign', sun_sign, COUNT(*) FROM tokens WHERE sun_sign IS NOT NULL GROUP BY sun_sign
      UNION ALL SELECT 'drug', drug, COUNT(*) FROM tokens WHERE drug IS NOT NULL GROUP BY drug
      UNION ALL SELECT 'background', background, COUNT(*) FROM tokens WHERE background IS NOT NULL GROUP BY background
      UNION ALL SELECT 'body', body, COUNT(*) FROM tokens WHERE body IS NOT NULL GROUP BY body
      UNION ALL SELECT 'eyes', eyes, COUNT(*) FROM tokens WHERE eyes IS NOT NULL GROUP BY eyes
      UNION ALL SELECT 'eyebrows', eyebrows, COUNT(*) FROM tokens WHERE eyebrows IS NOT NULL GROUP BY eyebrows
      UNION ALL SELECT 'mouth', mouth, COUNT(*) FROM tokens WHERE mouth IS NOT NULL GROUP BY mouth
      UNION ALL SELECT 'hair', hair, COUNT(*) FROM tokens WHERE hair IS NOT NULL GROUP BY hair
      UNION ALL SELECT 'hat', hat, COUNT(*) FROM tokens WHERE hat IS NOT NULL GROUP BY hat
      UNION ALL SELECT 'glasses', glasses, COUNT(*) FROM tokens WHERE glasses IS NOT NULL GROUP BY glasses
      UNION ALL SELECT 'shirt', shirt, COUNT(*) FROM tokens WHERE shirt IS NOT NULL GROUP BY shirt
      UNION ALL SELECT 'swagRank', swag_rank, COUNT(*) FROM tokens GROUP BY swag_rank
      UNION ALL SELECT 'grail', grail_category, COUNT(*) FROM tokens WHERE is_grail = TRUE GROUP BY grail_category
    `

    // Group rows by category
    const grouped = new Map<string, TraitRow[]>()
    for (const r of rows) {
      const list = grouped.get(r.category) ?? []
      list.push(r)
      grouped.set(r.category, list)
    }

    const toTraitCounts = (key: string, total = 10000): TraitCount[] =>
      (grouped.get(key) ?? [])
        .filter((r) => r.value !== null)
        .map((r) => ({
          value: r.value as string,
          count: Number(r.count),
          pct:   Math.round((Number(r.count) / total) * 10000) / 100,
        }))
        .sort((a, b) => b.count - a.count)

    const response: TraitDistribution = {
      archetypes:      toTraitCounts('archetype'),
      ancestors:       toTraitCounts('ancestor'),
      elements:        toTraitCounts('element'),
      sunSigns:        toTraitCounts('sunSign'),
      drugs:           toTraitCounts('drug'),
      backgrounds:     toTraitCounts('background'),
      bodies:          toTraitCounts('body'),
      eyes:            toTraitCounts('eyes'),
      eyebrows:        toTraitCounts('eyebrows'),
      mouths:          toTraitCounts('mouth'),
      hairs:           toTraitCounts('hair'),
      hats:            toTraitCounts('hat'),
      glasses:         toTraitCounts('glasses'),
      shirts:          toTraitCounts('shirt'),
      swagRanks:       toTraitCounts('swagRank'),
      grailCategories: toTraitCounts('grail', 42),
      grailCount:      42,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[/api/traits]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
