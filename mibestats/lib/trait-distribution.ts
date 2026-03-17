import { prisma } from '@/lib/db'
import { toTraitCounts } from '@/lib/traits'
import type { TraitDistribution } from '@/types'

interface TraitRow { category: string; value: string | null; count: bigint }

/**
 * Single UNION ALL query for all trait distributions.
 * Shared between the server page (unstable_cache) and the API route.
 */
export async function fetchTraitDistribution(): Promise<TraitDistribution> {
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

  const grouped = new Map<string, TraitRow[]>()
  for (const r of rows) {
    const list = grouped.get(r.category) ?? []
    list.push(r)
    grouped.set(r.category, list)
  }

  const counts = (key: string, total = 10000) => toTraitCounts(grouped.get(key) ?? [], total)

  return {
    archetypes:      counts('archetype'),
    ancestors:       counts('ancestor'),
    elements:        counts('element'),
    timePeriods:     counts('timePeriod'),
    sunSigns:        counts('sunSign'),
    moonSigns:       counts('moonSign'),
    ascendingSigns:  counts('ascendingSign'),
    drugs:           counts('drug'),
    backgrounds:     counts('background'),
    bodies:          counts('body'),
    eyes:            counts('eyes'),
    eyebrows:        counts('eyebrows'),
    mouths:          counts('mouth'),
    hairs:           counts('hair'),
    hats:            counts('hat'),
    glasses:         counts('glasses'),
    masks:           counts('mask'),
    earrings:        counts('earrings'),
    faceAccessories: counts('faceAccessory'),
    tattoos:         counts('tattoo'),
    items:           counts('item'),
    shirts:          counts('shirt'),
    swagRanks:       counts('swagRank'),
    grailCategories: counts('grail', 42),
    grailCount:      42,
    chronoAreas:     counts('chronoArea', (grouped.get('chronoArea') ?? []).reduce((s, r) => s + Number(r.count), 0) || 10000),
  }
}
