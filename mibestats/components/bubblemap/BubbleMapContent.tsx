'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BubbleMapNode, BubbleMapLink, BubbleMapResponse } from '@/types'
import { ForceGraph } from './ForceGraph'
import { BubbleMapStats } from './BubbleMapStats'

const TIERS = ['whale', 'dolphin', 'shark', 'fish', 'shrimp'] as const
const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  dolphin: '#ff69b4',
  shark: '#58a6ff',
  fish: '#3fb950',
  shrimp: '#555',
}
const DISPLAY_LIMIT = 200

export function BubbleMapContent() {
  const [data, setData] = useState<BubbleMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [activeTiers, setActiveTiers] = useState<Set<string>>(new Set(TIERS))
  const [searchAddr, setSearchAddr] = useState('')
  const [focusedAddr, setFocusedAddr] = useState<string | null>(null)

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

  // Called when user clicks a node in the graph
  const handleNodeFocus = useCallback((address: string) => {
    setFocusedAddr((prev) => prev === address ? null : address)
    setSearchAddr(address)
  }, [])

  // Filter and limit for graph display
  const { graphNodes, graphLinks, allFilteredNodes, allFilteredLinks } = useMemo(() => {
    if (!data) return { graphNodes: [], graphLinks: [], allFilteredNodes: [], allFilteredLinks: [] }

    // Apply tier filter to get full filtered set
    const tierNodes = data.nodes.filter((n) => activeTiers.has(n.tier))
    const tierNodeIds = new Set(tierNodes.map((n) => n.id))
    const tierLinks = data.links.filter((l) => tierNodeIds.has(l.source) && tierNodeIds.has(l.target))

    // For stats: all filtered (no display limit)
    const allFilteredNodes = tierNodes
    const allFilteredLinks = tierLinks

    // For graph: limit displayed nodes (keep top by count)
    let graphNodes: BubbleMapNode[] = tierNodes
    let graphLinks: BubbleMapLink[] = tierLinks

    if (graphNodes.length > DISPLAY_LIMIT) {
      const sorted = [...graphNodes].sort((a, b) => b.count - a.count)
      const displayNodes = sorted.slice(0, DISPLAY_LIMIT)
      const displayIds = new Set(displayNodes.map((n) => n.id))

      // If focused address is outside top N, add it + its neighbors
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

    return { graphNodes, graphLinks, allFilteredNodes, allFilteredLinks }
  }, [data, activeTiers, focusedAddr])

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

  const isLimited = allFilteredNodes.length > DISPLAY_LIMIT

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Stats: gold cards + table + pie */}
      <BubbleMapStats nodes={allFilteredNodes} links={allFilteredLinks} />

      {/* 2. Filters row — directly above graph */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        {/* Tier filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">Filter by Tier</span>
          <div className="flex gap-1.5 flex-wrap">
            {TIERS.map((tier) => {
              const active = activeTiers.has(tier)
              return (
                <button
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                    active ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                  style={active ? { borderBottom: `2px solid ${TIER_COLORS[tier]}` } : undefined}
                >
                  {tier}
                </button>
              )
            })}
          </div>
        </div>

        {/* Address search */}
        <div className="flex flex-col gap-1 sm:ml-auto">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">Search Address</span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchAddr}
              onChange={(e) => setSearchAddr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="0x..."
              className="bg-mibe-bg border border-mibe-border rounded px-2.5 py-1 text-xs text-white w-48 focus:border-mibe-gold focus:outline-none"
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
      </div>

      {/* Display limit notice */}
      {isLimited && !focusedAddr && (
        <div className="text-[0.6875rem] text-mibe-text-2 bg-white/5 rounded px-3 py-1.5 -mt-2">
          Showing top {DISPLAY_LIMIT} wallets in graph (out of {allFilteredNodes.length}). Click a bubble or search an address to focus.
        </div>
      )}

      {/* 3. Graph */}
      <ForceGraph
        nodes={graphNodes}
        links={graphLinks}
        focusedAddress={focusedAddr}
        onNodeFocus={handleNodeFocus}
      />
    </div>
  )
}
