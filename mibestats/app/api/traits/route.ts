import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/api-handler'
import type { TraitCount, TraitDistribution } from '@/types'

export const revalidate = 86400   // 24-hour cache — trait distribution is static

interface TraitRow { category: string; value: string | null; count: bigint }

export const GET = withRateLimit('traits', 100, async (req) => {
  // Single query with UNION ALL — avoids exhausting connection pool
  const rows = await prisma.$queryRaw<TraitRow[]>`
    SELECT 'archetype' AS category, archetype AS value, COUNT(*) AS count FROM tokens GROUP BY archetype
    UNION ALL SELECT 'ancestor', ancestor, COUNT(*) FROM tokens GROUP BY ancestor
    UNION ALL SELECT 'element', element, COUNT(*) FROM tokens WHERE element IS NOT NULL GROUP BY element
    UNION ALL SELECT 'timePeriod', time_period, COUNT(*) FROM tokens GROUP BY time_period
    UNION ALL SELECT 'sunSign', sun_sign, COUNT(*) FROM tokens WHERE sun_sign IS NOT NULL GROUP BY sun_sign
    UNION ALL SELECT 'moonSign', moon_sign, COUNT(*) FROM tokens WHERE moon_sign IS NOT NULL GROUP BY moon_sign
    UNION ALL SELECT 'ascendingSign', ascending_sign, COUNT(*) FROM tokens WHERE ascending_sign IS NOT NULL GROUP BY ascending_sign
    UNION ALL SELECT 'drug', drug, COUNT(*) FROM tokens WHERE drug IS NOT NULL GROUP BY drug
    UNION ALL SELECT 'background', background, COUNT(*) FROM tokens WHERE background IS NOT NULL GROUP BY background
    UNION ALL SELECT 'body', body, COUNT(*) FROM tokens WHERE body IS NOT NULL GROUP BY body
    UNION ALL SELECT 'eyes', eyes, COUNT(*) FROM tokens WHERE eyes IS NOT NULL GROUP BY eyes
    UNION ALL SELECT 'eyebrows', eyebrows, COUNT(*) FROM tokens WHERE eyebrows IS NOT NULL GROUP BY eyebrows
    UNION ALL SELECT 'mouth', mouth, COUNT(*) FROM tokens WHERE mouth IS NOT NULL GROUP BY mouth
    UNION ALL SELECT 'hair', hair, COUNT(*) FROM tokens WHERE hair IS NOT NULL GROUP BY hair
    UNION ALL SELECT 'hat', hat, COUNT(*) FROM tokens WHERE hat IS NOT NULL GROUP BY hat
    UNION ALL SELECT 'glasses', glasses, COUNT(*) FROM tokens WHERE glasses IS NOT NULL GROUP BY glasses
    UNION ALL SELECT 'mask', mask, COUNT(*) FROM tokens WHERE mask IS NOT NULL GROUP BY mask
    UNION ALL SELECT 'earrings', earrings, COUNT(*) FROM tokens WHERE earrings IS NOT NULL GROUP BY earrings
    UNION ALL SELECT 'faceAccessory', face_accessory, COUNT(*) FROM tokens WHERE face_accessory IS NOT NULL GROUP BY face_accessory
    UNION ALL SELECT 'tattoo', tattoo, COUNT(*) FROM tokens WHERE tattoo IS NOT NULL GROUP BY tattoo
    UNION ALL SELECT 'item', item, COUNT(*) FROM tokens WHERE item IS NOT NULL GROUP BY item
    UNION ALL SELECT 'shirt', shirt, COUNT(*) FROM tokens WHERE shirt IS NOT NULL GROUP BY shirt
    UNION ALL SELECT 'swagRank', swag_rank, COUNT(*) FROM tokens GROUP BY swag_rank
    UNION ALL SELECT 'grail', grail_category, COUNT(*) FROM tokens WHERE is_grail = TRUE GROUP BY grail_category
    UNION ALL
    SELECT 'chronoArea' AS category,
      CASE
        WHEN ck < -100000 THEN 'Prehistory'
        WHEN ck < -10000  THEN 'Paleolithic'
        WHEN ck < -5000   THEN 'Neolithic'
        WHEN ck < -500    THEN 'Early Antiquity'
        WHEN ck < 0       THEN 'Late Antiquity'
        WHEN ck < 500     THEN 'Early Middle Ages'
        WHEN ck < 1500    THEN 'Middle Ages'
        WHEN ck < 1800    THEN 'Modern Times'
        WHEN ck < 1950    THEN 'Contemporary Era'
        ELSE '20th Century and beyond'
      END AS value,
      COUNT(*) AS count
    FROM (
      SELECT
        CASE WHEN UPPER(SPLIT_PART(birthday, ' ', 2)) = 'BCE'
          THEN -CAST(SPLIT_PART(SPLIT_PART(birthday, ' ', 1), '/', 3) AS INTEGER)
          ELSE CAST(SPLIT_PART(SPLIT_PART(birthday, ' ', 1), '/', 3) AS INTEGER)
        END AS ck
      FROM tokens WHERE birthday IS NOT NULL
    ) _ck
    GROUP BY 2
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

  const chronoTotal = (grouped.get('chronoArea') ?? []).reduce((s, r) => s + Number(r.count), 0)

  const response: TraitDistribution = {
    archetypes:      toTraitCounts('archetype'),
    ancestors:       toTraitCounts('ancestor'),
    elements:        toTraitCounts('element'),
    timePeriods:     toTraitCounts('timePeriod'),
    sunSigns:        toTraitCounts('sunSign'),
    moonSigns:       toTraitCounts('moonSign'),
    ascendingSigns:  toTraitCounts('ascendingSign'),
    drugs:           toTraitCounts('drug'),
    backgrounds:     toTraitCounts('background'),
    bodies:          toTraitCounts('body'),
    eyes:            toTraitCounts('eyes'),
    eyebrows:        toTraitCounts('eyebrows'),
    mouths:          toTraitCounts('mouth'),
    hairs:           toTraitCounts('hair'),
    hats:            toTraitCounts('hat'),
    glasses:         toTraitCounts('glasses'),
    masks:           toTraitCounts('mask'),
    earrings:        toTraitCounts('earrings'),
    faceAccessories: toTraitCounts('faceAccessory'),
    tattoos:         toTraitCounts('tattoo'),
    items:           toTraitCounts('item'),
    shirts:          toTraitCounts('shirt'),
    swagRanks:       toTraitCounts('swagRank'),
    grailCategories: toTraitCounts('grail', 42),
    grailCount:      42,
    chronoAreas:     toTraitCounts('chronoArea', chronoTotal || 10000),
  }

  return NextResponse.json(response)
}, { cacheSecs: 3600 })
