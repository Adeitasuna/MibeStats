'use client'

import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { BubbleMapNode, BubbleMapLink } from '@/types'

interface Props {
  nodes: BubbleMapNode[]
  links: BubbleMapLink[]
}

const TIER_ORDER = ['whale', 'dolphin', 'shark', 'fish', 'shrimp'] as const
const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  dolphin: '#ff69b4',
  shark: '#58a6ff',
  fish: '#3fb950',
  shrimp: '#555',
}

export function BubbleMapStats({ nodes, links }: Props) {
  const { walletCount, bidirectionalPairs, tierData, sortedWallets } = useMemo(() => {
    const tierCounts = nodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.tier] = (acc[n.tier] ?? 0) + 1
      return acc
    }, {})

    const tierData = TIER_ORDER
      .filter((t) => tierCounts[t])
      .map((t) => ({ name: `${t} (${tierCounts[t]})`, value: tierCounts[t], color: TIER_COLORS[t] }))

    return {
      walletCount: nodes.length,
      bidirectionalPairs: Math.floor(links.filter((l) => l.bidirectional).length / 2),
      tierData,
      sortedWallets: [...nodes].sort((a, b) => b.count - a.count),
    }
  }, [nodes, links])

  return (
    <div className="flex flex-col gap-4">
      {/* Gold stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <GoldCard label="Total Wallets" value={walletCount.toLocaleString()} />
        <GoldCard label="Bidirectional Connections" value={bidirectionalPairs.toLocaleString()} />
      </div>

      {/* Table + Pie chart side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address table */}
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Wallets by NFT Count
          </span>
          <div className="stat-card p-0 overflow-hidden">
            <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[0.625rem] uppercase tracking-wider text-mibe-text-2">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Address</th>
                    <th className="px-3 py-2 text-right">NFTs</th>
                    <th className="px-3 py-2 text-left">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedWallets.slice(0, 50).map((w, i) => (
                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-3 py-1.5 text-mibe-muted">{i + 1}</td>
                      <td className="px-3 py-1.5 font-mono">
                        {w.id.slice(0, 6)}...{w.id.slice(-4)}
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold text-white">{w.count}</td>
                      <td className="px-3 py-1.5">
                        <span className="capitalize" style={{ color: TIER_COLORS[w.tier] }}>{w.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tier distribution pie chart */}
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Tier Distribution
          </span>
          <div className="stat-card" style={{ padding: '0.75rem' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={35}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                  stroke="none"
                >
                  {tierData.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 12, color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string) => {
                    const pct = walletCount > 0 ? ((value / walletCount) * 100).toFixed(1) : '0.0'
                    return [`${pct}% (${value.toLocaleString()})`, name]
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-mibe-gold">{label}</span>
      <div className="stat-card stat-card--gold">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
    </div>
  )
}
