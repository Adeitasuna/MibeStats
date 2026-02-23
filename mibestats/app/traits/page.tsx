import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { TraitFilter } from '@/components/traits/TraitFilter'
import { TokenCard } from '@/components/traits/TokenCard'
import { TraitDistributionChart } from '@/components/traits/TraitDistributionChart'
import { RarityLeaderboard } from '@/components/traits/RarityLeaderboard'
import { toTraitCounts } from '@/lib/traits'
import { magicEdenUrl } from '@/types'
import type { TraitCount, TraitDistribution } from '@/types'

export const metadata: Metadata = {
  title: 'Traits & Rarity Explorer',
  description:
    'Explore Mibera333 traits, rarity rankings, and filter by any attribute combination.',
}

export const revalidate = 86400   // 24-hour ISR

// ─── Helpers ────────────────────────────────────────────────────────────────

type SearchParams = Record<string, string | string[] | undefined>

function flatten(sp: SearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (v !== undefined) out[k] = Array.isArray(v) ? v[0] : v
  }
  return out
}

// ─── Cached data fetchers ────────────────────────────────────────────────────

const getTraits = unstable_cache(
  async (): Promise<TraitDistribution> => {
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
    return {
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
      grailCategories: grailRows
        .filter((r) => r.grail_category !== null)
        .map((r) => ({
          value: r.grail_category as string,
          count: Number(r.count),
          pct:   Math.round((Number(r.count) / 42) * 10000) / 100,
        })),
      grailCount: 42,
    }
  },
  ['traits-distribution'],
  { revalidate: 86400, tags: ['traits'] },
)

const getLeaderboard = unstable_cache(
  async () => {
    const rows = await prisma.token.findMany({
      where:   { swagRank: { in: ['SSS', 'SS'] } },
      orderBy: { rarityRank: 'asc' },
      take:    100,
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
    })
    return rows.map((r) => ({
      ...r,
      lastSalePrice: r.lastSalePrice ? Number(r.lastSalePrice) : null,
      maxSalePrice:  r.maxSalePrice  ? Number(r.maxSalePrice)  : null,
      magicEdenUrl:  magicEdenUrl(r.tokenId),
    }))
  },
  ['traits-leaderboard'],
  { revalidate: 3600, tags: ['tokens'] },
)

const VALID_SORT = ['swag_desc', 'swag_asc', 'id_asc', 'price_desc'] as const
type Sort = (typeof VALID_SORT)[number]

function buildOrderBy(sort: string): Prisma.TokenOrderByWithRelationInput {
  switch (sort) {
    case 'swag_asc':   return { swagScore: 'asc' }
    case 'id_asc':     return { tokenId: 'asc' }
    case 'price_desc': return { lastSalePrice: 'desc' }
    default:           return { swagScore: 'desc' }
  }
}

async function getTokens(params: Record<string, string>) {
  const sort  = VALID_SORT.includes(params.sort as Sort) ? (params.sort as Sort) : 'swag_desc'
  const page  = Math.max(1, parseInt(params.page  ?? '1',  10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(params.limit ?? '50', 10) || 50))

  const where: Prisma.TokenWhereInput = {}
  if (params.archetype)  where.archetype  = params.archetype
  if (params.ancestor)   where.ancestor   = params.ancestor
  if (params.element)    where.element    = params.element
  if (params.drug)       where.drug       = params.drug
  if (params.hat)        where.hat        = params.hat
  if (params.glasses)    where.glasses    = params.glasses
  if (params.shirt)      where.shirt      = params.shirt
  if (params.background) where.background = params.background
  if (params.swag_rank)  where.swagRank   = params.swag_rank
  if (params.is_grail !== undefined) where.isGrail = params.is_grail === 'true'

  const [total, rows] = await Promise.all([
    prisma.token.count({ where }),
    prisma.token.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip:    (page - 1) * limit,
      take:    limit,
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

  return {
    data: rows.map((r) => ({
      ...r,
      lastSalePrice: r.lastSalePrice ? Number(r.lastSalePrice) : null,
      maxSalePrice:  r.maxSalePrice  ? Number(r.maxSalePrice)  : null,
      magicEdenUrl:  magicEdenUrl(r.tokenId),
    })),
    total,
    page,
    limit,
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

const SORT_LABELS: Record<Sort, string> = {
  swag_desc:  'Swag ↓',
  swag_asc:   'Swag ↑',
  id_asc:     'ID ↑',
  price_desc: 'Price ↓',
}

export default async function TraitsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params      = flatten(searchParams)
  const activeSort  = (VALID_SORT.includes(params.sort as Sort) ? params.sort : 'swag_desc') as Sort
  const activeChart = params.chart_cat ?? 'archetypes'
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const [traits, tokens, leaderboard] = await Promise.all([
    getTraits(),
    getTokens(params),
    getLeaderboard(),
  ])

  const totalPages = Math.ceil(tokens.total / tokens.limit)

  const makeUrl = (overrides: Record<string, string | null>) => {
    const sp = new URLSearchParams(params)
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null) sp.delete(k)
      else sp.set(k, v)
    }
    return `/traits?${sp.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Traits &amp; Rarity Explorer</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {tokens.total.toLocaleString()} token{tokens.total !== 1 ? 's' : ''} match your filters
          </p>
        </div>
        {/* Sort buttons */}
        <div className="flex gap-1.5 shrink-0">
          {VALID_SORT.map((s) => (
            <Link
              key={s}
              href={makeUrl({ sort: s, page: '1' })}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                activeSort === s
                  ? 'bg-white/15 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {SORT_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar */}
        <aside className="lg:w-72 shrink-0">
          <TraitFilter traits={traits} currentFilters={params} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Trait distribution chart */}
          <div className="card p-4">
            <TraitDistributionChart
              traits={traits}
              activeCategory={activeChart}
              currentFilters={params}
            />
          </div>

          {/* Token grid */}
          {tokens.data.length === 0 ? (
            <div className="card p-12 text-center space-y-3">
              <p className="text-gray-400">No tokens match these filters.</p>
              <Link
                href="/traits"
                className="text-yellow-400 text-sm hover:underline inline-block"
              >
                Reset filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {tokens.data.map((token) => (
                <TokenCard key={token.tokenId} token={token} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Page {currentPage} of {totalPages}{' '}
                <span className="hidden sm:inline">
                  ({tokens.total.toLocaleString()} tokens)
                </span>
              </span>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={makeUrl({ page: String(currentPage - 1) })}
                    className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={makeUrl({ page: String(currentPage + 1) })}
                    className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rarity leaderboard */}
      <RarityLeaderboard tokens={leaderboard} />
    </div>
  )
}
