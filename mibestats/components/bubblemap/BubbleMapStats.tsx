'use client'

import { useMemo, useState } from 'react'
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
const PAGE_SIZE = 20

export function BubbleMapStats({ nodes, links }: Props) {
  const [page, setPage] = useState(0)

  const { walletCount, transferCount, bidirectionalPairs, tierData, nftDistData, totalNfts, sortedWallets } = useMemo(() => {
    const tierCounts = nodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.tier] = (acc[n.tier] ?? 0) + 1
      return acc
    }, {})

    const tierData = TIER_ORDER
      .filter((t) => tierCounts[t])
      .map((t) => ({ name: `${t} (${tierCounts[t]})`, value: tierCounts[t], color: TIER_COLORS[t] }))

    const sorted = [...nodes].sort((a, b) => b.count - a.count)
    const totalNfts = nodes.reduce((s, n) => s + n.count, 0)

    // NFT distribution: top 10 wallets by name + "Others"
    const top10 = sorted.slice(0, 10)
    const othersCount = sorted.slice(10).reduce((s, n) => s + n.count, 0)
    const nftDistData = [
      ...top10.map((w) => ({
        name: `${w.id.slice(0, 6)}...${w.id.slice(-4)}`,
        value: w.count,
      })),
      ...(othersCount > 0 ? [{ name: 'Others', value: othersCount }] : []),
    ]

    return {
      walletCount: nodes.length,
      transferCount: links.length,
      bidirectionalPairs: Math.floor(links.filter((l) => l.bidirectional).length / 2),
      tierData,
      nftDistData,
      totalNfts,
      sortedWallets: sorted,
    }
  }, [nodes, links])

  const totalPages = Math.ceil(sortedWallets.length / PAGE_SIZE)
  const pagedWallets = sortedWallets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      {/* 3 Gold cards on one line */}
      <div className="grid grid-cols-3 gap-3">
        <GoldCard label="Total Wallets" value={walletCount.toLocaleString()} />
        <GoldCard label="Transfers" value={transferCount.toLocaleString()} />
        <GoldCard label="Bidirectional" value={bidirectionalPairs.toLocaleString()} />
      </div>

      {/* Table (left 1/2) + Charts (right 1/2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address table */}
        <div className="flex flex-col gap-1">
          <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Wallets by NFT Count
          </span>
          <div className="stat-card p-0 overflow-hidden flex flex-col">
            <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-[0.5625rem] uppercase tracking-wider text-mibe-text-2">
                    <th className="px-2 py-1.5 text-left w-8">#</th>
                    <th className="px-2 py-1.5 text-left">Address</th>
                    <th className="px-2 py-1.5 text-right w-12">NFTs</th>
                    <th className="px-2 py-1.5 text-left w-16">Tier</th>
                  </tr>
                </thead>
                <tbody className="text-[0.625rem]">
                  {pagedWallets.map((w, i) => (
                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-2 py-1 text-mibe-muted">{page * PAGE_SIZE + i + 1}</td>
                      <td className="px-2 py-1 font-mono text-[0.5625rem] text-mibe-text break-all">{w.id}</td>
                      <td className="px-2 py-1 text-right font-bold text-white">{w.count}</td>
                      <td className="px-2 py-1">
                        <span className="capitalize text-[0.5625rem]" style={{ color: TIER_COLORS[w.tier] }}>{w.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-1.5 border-t border-white/10 text-[0.5625rem] text-mibe-text-2">
                <span>{sortedWallets.length} wallets</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  <span>{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: 2 charts stacked */}
        <div className="flex flex-col gap-4">
          {/* Tier distribution */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-mibe-gold">
              Tier Distribution
            </span>
            <div className="stat-card p-2">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={tierData} cx="50%" cy="50%" outerRadius={65} innerRadius={30} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
                    {tierData.map((d, i) => (
                      <Cell key={i} fill={d.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 11, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => {
                      const pct = walletCount > 0 ? ((value / walletCount) * 100).toFixed(1) : '0.0'
                      return [`${pct}%`, name]
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#8b949e' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NFT distribution across wallets */}
          <div className="flex flex-col gap-1">
            <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-mibe-gold">
              NFT Distribution ({totalNfts.toLocaleString()} NFTs)
            </span>
            <div className="stat-card p-2">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={nftDistData} cx="50%" cy="50%" outerRadius={65} innerRadius={30} dataKey="value" nameKey="name" paddingAngle={1} stroke="none">
                    {nftDistData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 11, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => {
                      const pct = totalNfts > 0 ? ((value / totalNfts) * 100).toFixed(1) : '0.0'
                      return [`${pct}%`, name]
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#8b949e' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PIE_COLORS = ['#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149', '#bc8cff', '#f0883e', '#8b949e', '#a5d6ff', '#ffc658', '#82ca9d']

function GoldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">{label}</span>
      <div className="stat-card stat-card--gold">
        <span className="text-xl font-bold text-white">{value}</span>
      </div>
    </div>
  )
}
