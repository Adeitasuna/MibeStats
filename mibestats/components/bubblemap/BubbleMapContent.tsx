'use client'

import { useCallback, useState } from 'react'
import { PacManLoader } from '@/components/ui/PacManLoader'
import dynamic from 'next/dynamic'
import { useBubbleMapData } from './useBubbleMapData'
import { BubblePieCharts } from './BubblePieCharts'
import { WalletTable } from './WalletTable'
import { TIERS, TIER_COLORS, TIER_LABELS, DISPLAY_LIMIT } from './bubblemap-constants'

const ForceGraph = dynamic(() => import('./ForceGraph').then((m) => m.ForceGraph), {
  ssr: false,
  loading: () => <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading graph…</div>,
})

export function BubbleMapContent() {
  // Filters
  const [activeTiers, setActiveTiers] = useState<Set<string>>(new Set(TIERS))
  const [searchAddr, setSearchAddr] = useState('')
  const [focusedAddr, setFocusedAddr] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const {
    data, loading, error, fetchData,
    graphNodes, graphLinks,
    allFilteredNodes,
    walletCount, transferCount, bidirectionalPairs,
    tierData, nftByTierData, nftDistData, totalNfts, sortedWallets,
  } = useBubbleMapData(activeTiers, focusedAddr)

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

  const isLimited = allFilteredNodes.length > DISPLAY_LIMIT

  if (loading) {
    return (
      <PacManLoader />
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
    <div id="bubble-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
      {/* Row 1: 3 gold cards */}
      <div style={{ gridColumn: 'span 6', display: 'contents' }} className="bubble-stats-row">
        <div style={{ gridColumn: 'span 2' }}>
          <GoldCard label="Total Wallets" value={walletCount.toLocaleString()} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <GoldCard label="Transfers" value={transferCount.toLocaleString()} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <GoldCard label="Bidirectional" value={bidirectionalPairs.toLocaleString()} />
        </div>
      </div>

      {/* Wallets table (cols 1-3, spanning rows 2-3) */}
      <WalletTable
        sortedWallets={sortedWallets}
        focusedAddr={focusedAddr}
        onNodeFocus={handleNodeFocus}
        page={page}
        setPage={setPage}
        tierColors={TIER_COLORS}
      />

      {/* Row 2-3 right: Pie charts (cols 4-6) */}
      <BubblePieCharts
        tierData={tierData}
        nftByTierData={nftByTierData}
        nftDistData={nftDistData}
        walletCount={walletCount}
        totalNfts={totalNfts}
      />

      {/* Row 3 left: Tier filters (cols 1-3) */}
      <div style={{ gridColumn: 'span 3' }} className="flex flex-col gap-1">
        <span className="card-title-upper">Filter by Tier</span>
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
        <span className="card-title-upper">Search Address</span>
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
        <div style={{ gridColumn: 'span 6' }} className="card-title-upper bg-white/5 rounded px-3 py-1.5">
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
      <span className="card-title-upper">{label}</span>
      <div className="stat-card stat-card--gold">
        <span className="text-xl font-bold text-white">{value}</span>
      </div>
    </div>
  )
}
