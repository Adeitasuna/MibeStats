'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { BubbleMapNode, BubbleMapLink, BubbleMapResponse } from '@/types'
import { ForceGraph } from './ForceGraph'

const TIERS = ['whale', 'dolphin', 'shark', 'fish', 'shrimp'] as const
const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  dolphin: '#ff69b4',
  shark: '#58a6ff',
  fish: '#3fb950',
  shrimp: '#555',
}
const TIER_LABELS: Record<string, string> = {
  whale: 'Whale (20+)',
  dolphin: 'Dolphin (10-19)',
  shark: 'Shark (5-9)',
  fish: 'Fish (2-4)',
  shrimp: 'Shrimp (1)',
}
const TIER_ORDER = ['whale', 'dolphin', 'shark', 'fish', 'shrimp'] as const
const PIE_COLORS = ['#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149', '#bc8cff', '#f0883e', '#8b949e', '#a5d6ff', '#ffc658', '#82ca9d']
const DISPLAY_LIMIT = 200
const PAGE_SIZE = 20

export function BubbleMapContent() {
  const [data, setData] = useState<BubbleMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [activeTiers, setActiveTiers] = useState<Set<string>>(new Set(TIERS))
  const [searchAddr, setSearchAddr] = useState('')
  const [focusedAddr, setFocusedAddr] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const fetchData = useCallback((signal?: AbortSignal) => {
    setLoading(true)
    setError(null)

    fetch('/api/bubblemap', { signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: BubbleMapResponse) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[BubbleMap]', err)
        setError('Failed to load bubble map data')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])

  const toggleTier = useCallback((tier: string) => {
    setActiveTiers((prev) => {
      const next = new Set(prev)
      if (next.has(tier)) next.delete(tier)
      else next.add(tier)
      return next
    })
  }, [])

  const handleSearch = useCallback(() => {
    const addr = searchAddr.trim().toLowerCase()
    if (!addr) { setFocusedAddr(null); return }
    const match = data?.nodes.find((n) => n.id.toLowerCase().includes(addr))
    setFocusedAddr(match?.id ?? null)
  }, [searchAddr, data])

  const handleClearFocus = useCallback(() => {
    setFocusedAddr(null)
    setSearchAddr('')
  }, [])

  const handleNodeFocus = useCallback((address: string) => {
    setFocusedAddr((prev) => prev === address ? null : address)
    setSearchAddr(address)
  }, [])

  // Filter and compute all stats
  const {
    graphNodes, graphLinks,
    allFilteredNodes, allFilteredLinks,
    walletCount, transferCount, bidirectionalPairs,
    tierData, nftDistData, totalNfts, sortedWallets,
  } = useMemo(() => {
    if (!data) return {
      graphNodes: [], graphLinks: [],
      allFilteredNodes: [], allFilteredLinks: [],
      walletCount: 0, transferCount: 0, bidirectionalPairs: 0,
      tierData: [], nftDistData: [], totalNfts: 0, sortedWallets: [],
    }

    // Apply tier filter
    const tierNodes = data.nodes.filter((n) => activeTiers.has(n.tier))
    const tierNodeIds = new Set(tierNodes.map((n) => n.id))
    const tierLinks = data.links.filter((l) => tierNodeIds.has(l.source) && tierNodeIds.has(l.target))

    const allFilteredNodes = tierNodes
    const allFilteredLinks = tierLinks

    // Stats
    const walletCount = tierNodes.length
    const transferCount = tierLinks.length
    const bidirectionalPairs = Math.floor(tierLinks.filter((l) => l.bidirectional).length / 2)

    // Tier distribution
    const tierCounts = tierNodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.tier] = (acc[n.tier] ?? 0) + 1
      return acc
    }, {})
    const tierData = TIER_ORDER
      .filter((t) => tierCounts[t])
      .map((t) => ({ name: `${t} (${tierCounts[t]})`, value: tierCounts[t], color: TIER_COLORS[t] }))

    // NFT distribution
    const sorted = [...tierNodes].sort((a, b) => b.count - a.count)
    const totalNfts = tierNodes.reduce((s, n) => s + n.count, 0)
    const top10 = sorted.slice(0, 10)
    const othersCount = sorted.slice(10).reduce((s, n) => s + n.count, 0)
    const nftDistData = [
      ...top10.map((w) => ({
        name: `${w.id.slice(0, 6)}...${w.id.slice(-4)}`,
        value: w.count,
      })),
      ...(othersCount > 0 ? [{ name: 'Others', value: othersCount }] : []),
    ]

    // Graph display limit — prioritize connected nodes so links are visible
    let graphNodes: BubbleMapNode[] = tierNodes
    let graphLinks: BubbleMapLink[] = tierLinks

    if (graphNodes.length > DISPLAY_LIMIT) {
      // Collect all nodes that participate in at least one link
      const linkedIds = new Set<string>()
      for (const l of tierLinks) {
        linkedIds.add(l.source)
        linkedIds.add(l.target)
      }

      // Start with connected nodes (they have links to show)
      const connectedNodes = tierNodes.filter((n) => linkedIds.has(n.id))
      // Fill remaining slots with top holders by NFT count
      const unconnectedTop = sorted.filter((n) => !linkedIds.has(n.id))

      const displayNodes = connectedNodes.length >= DISPLAY_LIMIT
        ? connectedNodes.slice(0, DISPLAY_LIMIT)
        : [...connectedNodes, ...unconnectedTop.slice(0, DISPLAY_LIMIT - connectedNodes.length)]

      const displayIds = new Set(displayNodes.map((n) => n.id))

      // Always include focused address + its neighbors
      if (focusedAddr && !displayIds.has(focusedAddr)) {
        const focusNode = tierNodes.find((n) => n.id === focusedAddr)
        if (focusNode) displayNodes.push(focusNode)
        displayIds.add(focusedAddr)
        for (const l of tierLinks) {
          if (l.source === focusedAddr && !displayIds.has(l.target)) {
            const nb = tierNodes.find((n) => n.id === l.target)
            if (nb) { displayNodes.push(nb); displayIds.add(l.target) }
          }
          if (l.target === focusedAddr && !displayIds.has(l.source)) {
            const nb = tierNodes.find((n) => n.id === l.source)
            if (nb) { displayNodes.push(nb); displayIds.add(l.source) }
          }
        }
      }

      graphNodes = displayNodes
      graphLinks = tierLinks.filter((l) => displayIds.has(l.source) && displayIds.has(l.target))
    }

    return {
      graphNodes, graphLinks, allFilteredNodes, allFilteredLinks,
      walletCount, transferCount, bidirectionalPairs,
      tierData, nftDistData, totalNfts, sortedWallets: sorted,
    }
  }, [data, activeTiers, focusedAddr])

  const totalPages = Math.ceil(sortedWallets.length / PAGE_SIZE)
  const pagedWallets = sortedWallets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const isLimited = allFilteredNodes.length > DISPLAY_LIMIT

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card p-3 border-mibe-red text-red-400 text-sm flex items-center justify-between">
        <span>{error ?? 'No data available'}</span>
        <button onClick={() => fetchData()} className="ml-3 px-3 py-1 rounded text-xs font-semibold bg-mibe-gold/15 text-mibe-gold hover:bg-mibe-gold/25 transition-colors">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
      {/* Row 1: 3 gold cards, each spanning 2 cols */}
      <div style={{ gridColumn: 'span 2' }}>
        <GoldCard label="Total Wallets" value={walletCount.toLocaleString()} />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <GoldCard label="Transfers" value={transferCount.toLocaleString()} />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <GoldCard label="Bidirectional" value={bidirectionalPairs.toLocaleString()} />
      </div>

      {/* Row 2 left: Wallets table (cols 1-3) */}
      <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-mibe-gold">
          Wallets by NFT Count
        </span>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.25rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 420,
        }}>
          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr className="border-b border-white/10 text-[0.5625rem] uppercase tracking-wider text-mibe-text-2">
                  <th className="px-2 py-1.5 text-left" style={{ width: 30 }}>#</th>
                  <th className="px-2 py-1.5 text-left">Address</th>
                  <th className="px-2 py-1.5 text-right" style={{ width: 50 }}>NFTs</th>
                  <th className="px-2 py-1.5 text-left" style={{ width: 60 }}>Tier</th>
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
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0, fontSize: '0.5625rem', color: '#888',
            }}>
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

      {/* Row 2 right: Charts stacked (cols 4-6) */}
      <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Tier distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Tier Distribution
          </span>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.25rem', padding: '0.5rem', flex: 1,
          }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={tierData} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
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

        {/* NFT distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-mibe-gold">
            NFT Distribution ({totalNfts.toLocaleString()} NFTs)
          </span>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.25rem', padding: '0.5rem', flex: 1,
          }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={nftDistData} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" nameKey="name" paddingAngle={1} stroke="none">
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

      {/* Row 3 left: Tier filters (cols 1-3) */}
      <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">Filter by Tier</span>
        <div className="flex gap-1.5 flex-wrap">
          {TIERS.map((tier) => {
            const active = activeTiers.has(tier)
            return (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  active ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
                style={active ? { borderBottom: `2px solid ${TIER_COLORS[tier]}` } : undefined}
              >
                {TIER_LABELS[tier]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Row 3 right: Search Address (cols 4-6) */}
      <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">Search Address</span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={searchAddr}
            onChange={(e) => setSearchAddr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="0x..."
            className="bg-mibe-bg border border-mibe-border rounded px-2.5 py-1 text-xs text-white flex-1 focus:border-mibe-gold focus:outline-none"
          />
          <button onClick={handleSearch} className="px-2.5 py-1 rounded text-xs font-semibold bg-mibe-gold/15 text-mibe-gold hover:bg-mibe-gold/25 transition-colors">
            Go
          </button>
          {focusedAddr && (
            <button onClick={handleClearFocus} className="px-2.5 py-1 rounded text-xs font-semibold bg-mibe-red/15 text-mibe-red hover:bg-mibe-red/25 transition-colors">
              Clear
            </button>
          )}
        </div>
        {focusedAddr && (
          <span className="text-[0.625rem] text-mibe-cyan">
            Focused: {focusedAddr.slice(0, 8)}...{focusedAddr.slice(-4)}
          </span>
        )}
        {searchAddr && !focusedAddr && searchAddr.length > 2 && (
          <span className="text-[0.625rem] text-mibe-red">Address not found</span>
        )}
      </div>

      {/* Row 4: Display limit notice (full width) */}
      {isLimited && !focusedAddr && (
        <div style={{ gridColumn: 'span 6' }} className="text-[0.6875rem] text-mibe-text-2 bg-white/5 rounded px-3 py-1.5">
          Showing top {DISPLAY_LIMIT} wallets in graph (out of {allFilteredNodes.length}). Click a bubble or search an address to focus.
        </div>
      )}

      {/* Row 5: Graph (full width) */}
      <div style={{ gridColumn: 'span 6' }}>
        <ForceGraph
          nodes={graphNodes}
          links={graphLinks}
          focusedAddress={focusedAddr}
          onNodeFocus={handleNodeFocus}
        />
      </div>
    </div>
  )
}

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
