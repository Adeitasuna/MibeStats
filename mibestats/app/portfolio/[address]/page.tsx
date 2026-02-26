import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { addressSchema } from '@/lib/validation'
import { magicEdenUrl } from '@/types'
import type { SwagRank } from '@/types'
import { PortfolioStats } from '@/components/portfolio/PortfolioStats'
import { HoldingsGrid } from '@/components/portfolio/HoldingsGrid'

export const dynamic = 'force-dynamic'   // Render at request time (requires DB)

interface Props {
  params: { address: string }
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `${params.address.slice(0, 6)}...${params.address.slice(-4)} Portfolio`,
  }
}

export default async function PortfolioAddressPage({ params }: Props) {
  // ─── Address validation ─────────────────────────────────────────────────────
  const parsed = addressSchema.safeParse(params.address)
  if (!parsed.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-xl font-semibold text-mibe-red">Invalid address</p>
        <p className="text-sm text-mibe-text-2">
          This is not a valid EIP-55 checksummed Ethereum address.
        </p>
        <Link
          href="/portfolio"
          className="px-4 py-2 rounded-lg bg-mibe-card border border-mibe-border hover:border-mibe-gold text-sm text-white transition-colors"
        >
          Search again
        </Link>
      </div>
    )
  }

  const address = parsed.data

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const [tokens, collectionStats] = await Promise.all([
    prisma.token.findMany({
      where:   { ownerAddress: address },
      orderBy: { rarityRank: 'asc' },
      select: {
        tokenId: true, archetype: true, ancestor: true, timePeriod: true,
        birthday: true, birthCoordinates: true,
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
    prisma.collectionStats.findUnique({ where: { id: 1 } }),
  ])

  // ─── Compute stats ──────────────────────────────────────────────────────────
  const count          = tokens.length
  const floorPrice     = collectionStats?.floorPrice ? Number(collectionStats.floorPrice) : null
  const estimatedValue = floorPrice != null ? count * floorPrice : null
  const grailCount     = tokens.filter((t) => t.isGrail).length
  const avgRarityRank  = count > 0
    ? Math.round(tokens.reduce((s, t) => s + (t.rarityRank ?? 10000), 0) / count)
    : null
  const highestSwagScore = count > 0
    ? Math.max(...tokens.map((t) => t.swagScore))
    : null

  const mappedTokens = tokens.map((t) => ({
    ...t,
    swagRank:      t.swagRank as SwagRank,
    lastSalePrice: t.lastSalePrice ? Number(t.lastSalePrice) : null,
    maxSalePrice:  t.maxSalePrice  ? Number(t.maxSalePrice)  : null,
    magicEdenUrl:  magicEdenUrl(t.tokenId),
  }))

  const short = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/portfolio"
          className="text-mibe-text-2 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Portfolio
        </Link>
        <h1 className="section-title text-xl font-mono">{short}</h1>
        {count > 0 && (
          <span className="text-sm text-mibe-text-2">
            {count} Mibera{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Stats */}
      <PortfolioStats
        stats={{ count, estimatedValue, avgRarityRank, highestSwagScore, grailCount }}
      />

      {/* Holdings */}
      <section>
        <h2 className="text-[10px] font-semibold text-mibe-gold uppercase tracking-wider mb-3">
          Holdings
        </h2>
        <HoldingsGrid tokens={mappedTokens} />
      </section>
    </div>
  )
}
