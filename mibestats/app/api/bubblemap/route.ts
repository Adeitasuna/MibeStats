import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/api-handler'

export const revalidate = 300

interface WalletRow { address: string; count: bigint }
interface EdgeRow { source: string; target: string; weight: bigint; volume: string }

function tierFromCount(count: number): string {
  if (count >= 100) return 'whale'
  if (count >= 35) return 'diamond'
  if (count >= 10) return 'gold'
  if (count >= 4) return 'silver'
  if (count >= 2) return 'bronze'
  return 'holder'
}

export const GET = withRateLimit('bubblemap', 30, async (req) => {
  const [wallets, edges] = await Promise.all([
    // Current holders only (count >= 1)
    prisma.$queryRaw<WalletRow[]>`
      SELECT owner_address AS address, COUNT(*)::bigint AS count
      FROM tokens
      WHERE owner_address IS NOT NULL
        AND owner_address != '0x0000000000000000000000000000000000000000'
        AND owner_address != '0x000000000000000000000000000000000000dead'
      GROUP BY owner_address
    `,

    // Edges between wallets — only include trades where BOTH parties
    // are current holders (filtered in JS below)
    prisma.$queryRaw<EdgeRow[]>`
      SELECT seller_address AS source,
             buyer_address AS target,
             COUNT(*)::bigint AS weight,
             SUM(price_bera)::text AS volume
      FROM sales
      WHERE seller_address IS NOT NULL
        AND buyer_address IS NOT NULL
        AND seller_address != buyer_address
      GROUP BY seller_address, buyer_address
    `,
  ])

  // Build holder set (lowercase)
  const holderMap = new Map<string, number>()
  for (const w of wallets) {
    holderMap.set(w.address.toLowerCase(), Number(w.count))
  }

  // Detect bidirectional edges (lowercase keys)
  const edgeKeys = new Set<string>()
  for (const e of edges) {
    edgeKeys.add(`${e.source.toLowerCase()}→${e.target.toLowerCase()}`)
  }

  // Only keep edges where both endpoints are current holders
  const links = []
  for (const e of edges) {
    const src = e.source.toLowerCase()
    const tgt = e.target.toLowerCase()
    if (!holderMap.has(src) || !holderMap.has(tgt)) continue
    links.push({
      source: src,
      target: tgt,
      weight: Number(e.weight),
      volume: Math.round(Number(e.volume) * 100) / 100,
      bidirectional: edgeKeys.has(`${tgt}→${src}`),
    })
  }

  // Build nodes — current holders only (no historical count=0 wallets)
  const nodes = Array.from(holderMap.entries()).map(([address, count]) => ({
    id: address,
    count,
    tier: tierFromCount(count),
  }))

  return NextResponse.json({ nodes, links })
}, { cacheSecs: 600 })
