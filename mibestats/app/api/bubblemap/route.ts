import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const revalidate = 300

interface WalletRow { address: string; count: bigint }
interface EdgeRow { source: string; target: string; weight: bigint; volume: string }

function tierFromCount(count: number): string {
  if (count >= 20) return 'whale'
  if (count >= 10) return 'dolphin'
  if (count >= 5) return 'shark'
  if (count >= 2) return 'fish'
  return 'shrimp'
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`bubblemap:${ip}`, 30, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  try {
    const [wallets, edges] = await Promise.all([
      // All wallet nodes: address + NFT count (official collection only)
      prisma.$queryRaw<WalletRow[]>`
        SELECT owner_address AS address, COUNT(*)::bigint AS count
        FROM tokens
        WHERE owner_address IS NOT NULL
          AND owner_address != '0x0000000000000000000000000000000000000000'
          AND owner_address != '0x000000000000000000000000000000000000dead'
        GROUP BY owner_address
      `,

      // All wallet-to-wallet edges from sales
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

    // Wallet lookup (normalize addresses to lowercase)
    const walletMap = new Map<string, number>()
    for (const w of wallets) {
      walletMap.set(w.address.toLowerCase(), Number(w.count))
    }

    // Add edge participants that aren't current holders (count = 0)
    for (const e of edges) {
      const src = e.source.toLowerCase()
      const tgt = e.target.toLowerCase()
      if (!walletMap.has(src)) walletMap.set(src, 0)
      if (!walletMap.has(tgt)) walletMap.set(tgt, 0)
    }

    // Detect bidirectional edges (lowercase keys)
    const edgeKeys = new Set<string>()
    for (const e of edges) {
      edgeKeys.add(`${e.source.toLowerCase()}→${e.target.toLowerCase()}`)
    }

    // Build all nodes — current holders + historical trade participants
    const nodes = Array.from(walletMap.entries()).map(([address, count]) => ({
      id: address,
      count,
      tier: tierFromCount(count),
    }))

    // Build all links (all endpoints now guaranteed in walletMap)
    const links = edges.map((e) => ({
      source: e.source.toLowerCase(),
      target: e.target.toLowerCase(),
      weight: Number(e.weight),
      volume: Number(e.volume),
      bidirectional: edgeKeys.has(`${e.target.toLowerCase()}→${e.source.toLowerCase()}`),
    }))

    return NextResponse.json({ nodes, links })
  } catch (err) {
    console.error('[/api/bubblemap]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
