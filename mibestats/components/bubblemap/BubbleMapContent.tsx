'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BubbleMapNode, BubbleMapLink, BubbleMapResponse } from '@/types'
import { TIER_COLORS } from '@/lib/chart-constants'
import { ForceGraph } from './ForceGraph'
import { GoldCard } from './GoldCard'
import { PieChartCard } from './PieChartCard'
import { WalletTable } from './WalletTable'
import { TierFilter } from './TierFilter'
import { AddressSearch } from './AddressSearch'
import {
  TIERS, TIER_LABELS, TIER_ORDER, PIE_COLORS,
  DISPLAY_LIMIT, DEFAULT_PAGE_SIZE,
} from './bubblemap-constants'

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
    allFilteredNodes,
    walletCount, transferCount, bidirectionalPairs,
    tierData, nftByTierData, nftDistData, totalNfts, sortedWallets,
  } = useMemo(() => {
    if (!data) return {
      graphNodes: [], graphLinks: [],
      allFilteredNodes: [],
      walletCount: 0, transferCount: 0, bidirectionalPairs: 0,
      tierData: [], nftByTierData: [], nftDistData: [], totalNfts: 0, sortedWallets: [],
    }

    // Apply tier filter
    const tierNodes = data.nodes.filter((n) => activeTiers.has(n.tier))
    const tierNodeIds = new Set(tierNodes.map((n) => n.id))
    const tierLinks = data.links.filter((l) => tierNodeIds.has(l.source) && tierNodeIds.has(l.target))

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

    // NFT count by tier
    const nftByTier = tierNodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.tier] = (acc[n.tier] ?? 0) + n.count
      return acc
    }, {})
    const totalNfts = tierNodes.reduce((s, n) => s + n.count, 0)
    const nftByTierData = TIER_ORDER
      .filter((t) => nftByTier[t])
      .map((t) => ({ name: `${TIER_LABELS[t]} (${nftByTier[t]})`, value: nftByTier[t], color: TIER_COLORS[t] }))

    // NFT distribution
    const sorted = [...tierNodes].sort((a, b) => b.count - a.count)
    const top10 = sorted.slice(0, 10)
    const othersCount = sorted.slice(10).reduce((s, n) => s + n.count, 0)
    const nftDistData = [
      ...top10.map((w) => ({
        name: `${w.id.slice(0, 6)}...${w.id.slice(-4)}`,
        value: w.count,
      })),
      ...(othersCount > 0 ? [{ name: 'Others', value: othersCount }] : []),
    ]

    // Graph display limit
    let graphNodes: BubbleMapNode[] = tierNodes
    let graphLinks: BubbleMapLink[] = tierLinks

    if (graphNodes.length > DISPLAY_LIMIT) {
      const linkedIds = new Set<string>()
      for (const l of tierLinks) {
        linkedIds.add(l.source)
        linkedIds.add(l.target)
      }

      const connectedNodes = tierNodes.filter((n) => linkedIds.has(n.id))
      const unconnectedTop = sorted.filter((n) => !linkedIds.has(n.id))

      const displayNodes = connectedNodes.length >= DISPLAY_LIMIT
        ? connectedNodes.slice(0, DISPLAY_LIMIT)
        : [...connectedNodes, ...unconnectedTop.slice(0, DISPLAY_LIMIT - connectedNodes.length)]

      const displayIds = new Set(displayNodes.map((n) => n.id))

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
      graphNodes, graphLinks, allFilteredNodes: tierNodes,
      walletCount, transferCount, bidirectionalPairs,
      tierData, nftByTierData, nftDistData, totalNfts, sortedWallets: sorted,
    }
  }, [data, activeTiers, focusedAddr])

  const isLimited = allFilteredNodes.length > DISPLAY_LIMIT

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <img src="/waiting.gif" alt="Loading..." className="max-w-[300px]" style={{ imageRendering: 'pixelated' }} />
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
    <div className="grid grid-cols-6 gap-4">
      {/* Row 1: 3 gold cards */}
      <div className="col-span-2">
        <GoldCard label="Total Wallets" value={walletCount.toLocaleString()} />
      </div>
      <div className="col-span-2">
        <GoldCard label="Transfers" value={transferCount.toLocaleString()} />
      </div>
      <div className="col-span-2">
        <GoldCard label="Bidirectional" value={bidirectionalPairs.toLocaleString()} />
      </div>

      {/* Wallets table (cols 1-3, spanning rows 2-3) */}
      <WalletTable
        sortedWallets={sortedWallets}
        page={page}
        setPage={setPage}
        focusedAddr={focusedAddr}
        onRowClick={handleNodeFocus}
      />

      {/* Row 2 right: Tier Distribution + NFTs by Tier */}
      <PieChartCard
        title="Tier Distribution"
        data={tierData}
        total={walletCount}
        className="col-start-4 col-end-5"
      />

      <PieChartCard
        title={`NFTs by Tier (${totalNfts.toLocaleString()} NFTs)`}
        data={nftByTierData}
        total={totalNfts}
        className="col-start-5 col-end-7"
      />

      {/* Row 3 right: NFT Distribution */}
      <PieChartCard
        title={`NFT Distribution (${totalNfts.toLocaleString()} NFTs)`}
        data={nftDistData}
        colors={PIE_COLORS}
        total={totalNfts}
        paddingAngle={1}
        className="col-start-4 col-end-7"
      />

      {/* Tier filters */}
      <TierFilter activeTiers={activeTiers} onToggle={toggleTier} />

      {/* Search Address */}
      <AddressSearch
        searchAddr={searchAddr}
        setSearchAddr={setSearchAddr}
        focusedAddr={focusedAddr}
        onSearch={handleSearch}
        onClear={handleClearFocus}
      />

      {/* Display limit notice */}
      {isLimited && !focusedAddr && (
        <div className="col-span-6 card-title-upper bg-white/5 rounded px-3 py-1.5">
          Showing top {DISPLAY_LIMIT} wallets in graph (out of {allFilteredNodes.length}). Click a bubble or search an address to focus.
        </div>
      )}

      {/* Graph */}
      <div className="col-span-6">
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
