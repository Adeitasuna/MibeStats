'use client'

import { useMemo } from 'react'
import type { BubbleMapNode, BubbleMapLink } from '@/types'

interface Props {
  nodes: BubbleMapNode[]
  links: BubbleMapLink[]
  totalNodes: number
  totalLinks: number
}

const TIER_ORDER = ['whale', 'dolphin', 'shark', 'fish', 'shrimp'] as const

export function BubbleMapStats({ nodes, links, totalNodes, totalLinks }: Props) {
  const { walletCount, connectionCount, bidirectionalPairs, tierCounts, topHolders } = useMemo(() => {
    const tierCounts = nodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.tier] = (acc[n.tier] ?? 0) + 1
      return acc
    }, {})

    return {
      walletCount: nodes.length,
      connectionCount: links.length,
      bidirectionalPairs: Math.floor(links.filter((l) => l.bidirectional).length / 2),
      tierCounts,
      topHolders: [...nodes].sort((a, b) => b.count - a.count).slice(0, 10),
    }
  }, [nodes, links])

  const isFiltered = walletCount !== totalNodes

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Wallets"
        value={walletCount.toLocaleString()}
        sub={isFiltered ? `/ ${totalNodes.toLocaleString()} total` : undefined}
      />
      <StatCard
        label="Connections"
        value={connectionCount.toLocaleString()}
        sub={isFiltered ? `/ ${totalLinks.toLocaleString()} total` : undefined}
      />
      <StatCard label="Bidirectional Pairs" value={bidirectionalPairs.toLocaleString()} color="text-mibe-red" />
      <StatCard
        label="By Tier"
        value={
          TIER_ORDER
            .filter((t) => tierCounts[t])
            .map((t) => `${t}: ${tierCounts[t]}`)
            .join(' / ')
        }
      />

      {/* Top holders row */}
      <div className="col-span-full">
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Top Holders{isFiltered ? ' (filtered)' : ''}
          </span>
          <div className="stat-card px-3 py-2">
            <div className="flex flex-wrap gap-2 text-xs">
              {topHolders.map((h, i) => (
                <span key={h.id} className={i === 0 ? 'text-mibe-gold' : 'text-gray-300'}>
                  {h.id.slice(0, 6)}...{h.id.slice(-4)}: <strong>{h.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-[0.6875rem] font-semibold uppercase tracking-wider ${color ?? 'text-mibe-gold'}`}>
        {label}
      </span>
      <div className="stat-card">
        <span className="text-lg font-bold text-white">{value}</span>
        {sub && <span className="text-[0.625rem] text-mibe-text-2 ml-1.5">{sub}</span>}
      </div>
    </div>
  )
}
