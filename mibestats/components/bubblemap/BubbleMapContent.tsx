'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BubbleMapNode, BubbleMapLink, BubbleMapResponse } from '@/types'
import { ForceGraph } from './ForceGraph'
import { BubbleMapStats } from './BubbleMapStats'

const TIERS = ['whale', 'dolphin', 'shark', 'fish', 'shrimp'] as const
const DISPLAY_LIMIT = 200 // max nodes rendered in graph for performance

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

  // Toggle a tier filter
  const toggleTier = useCallback((tier: string) => {
    setActiveTiers((prev) => {
      const next = new Set(prev)
      if (next.has(tier)) next.delete(tier)
      else next.add(tier)
      return next
    })
  }, [])

  // Handle address search
  const handleSearch = useCallback(() => {
    const addr = searchAddr.trim().toLowerCase()
    if (!addr) {
      setFocusedAddr(null)
      return
    }
    // Find matching address (partial match)
    const match = data?.nodes.find((n) => n.id.toLowerCase().includes(addr))
    setFocusedAddr(match?.id ?? null)
  }, [searchAddr, data])

  const handleClearFocus = useCallback(() => {
    setFocusedAddr(null)
    setSearchAddr('')
  }, [])

  // Filter nodes and links
  const { filteredNodes, filteredLinks, allFilteredNodes, allFilteredLinks } = useMemo(() => {
    if (!data) return { filteredNodes: [], filteredLinks: [], allFilteredNodes: [], allFilteredLinks: [] }

    let nodes: BubbleMapNode[]
    let links: BubbleMapLink[]

    if (focusedAddr) {
      // Focused mode: show target address + all its direct neighbors
      const neighborIds = new Set<string>()
      neighborIds.add(focusedAddr)
      for (const l of data.links) {
        if (l.source === focusedAddr) neighborIds.add(l.target)
        if (l.target === focusedAddr) neighborIds.add(l.source)
      }
      nodes = data.nodes.filter((n) => neighborIds.has(n.id))
      links = data.links.filter((l) => neighborIds.has(l.source) && neighborIds.has(l.target))
    } else {
      // Tier filter
      nodes = data.nodes.filter((n) => activeTiers.has(n.tier))
      const nodeIds = new Set(nodes.map((n) => n.id))
      links = data.links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
    }

    // All filtered (for stats — no display limit)
    const allFilteredNodes = nodes
    const allFilteredLinks = links

    // Limit displayed nodes for graph performance (keep top by count)
    if (nodes.length > DISPLAY_LIMIT) {
      const sorted = [...nodes].sort((a, b) => b.count - a.count)
      const displayNodes = sorted.slice(0, DISPLAY_LIMIT)
      const displayIds = new Set(displayNodes.map((n) => n.id))
      nodes = displayNodes
      links = links.filter((l) => displayIds.has(l.source) && displayIds.has(l.target))
    }

    return { filteredNodes: nodes, filteredLinks: links, allFilteredNodes, allFilteredLinks }
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
        <button
          onClick={() => fetchData()}
          className="ml-3 px-3 py-1 rounded text-xs font-semibold bg-mibe-gold/15 text-mibe-gold hover:bg-mibe-gold/25 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const isLimited = allFilteredNodes.length > DISPLAY_LIMIT && !focusedAddr

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tier filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Filter by Tier
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {TIERS.map((tier) => {
              const active = activeTiers.has(tier)
              return (
                <button
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  disabled={!!focusedAddr}
                  className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                    focusedAddr
                      ? 'opacity-40 cursor-not-allowed bg-white/5 text-gray-500'
                      : active
                        ? 'bg-white/10 text-white'
                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                  style={active && !focusedAddr ? { borderBottom: `2px solid ${TIER_COLORS[tier]}` } : undefined}
                >
                  {tier}
                </button>
              )
            })}
          </div>
        </div>

        {/* Address search */}
        <div className="flex flex-col gap-1 sm:ml-auto">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-mibe-gold">
            Search Address
          </span>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchAddr}
              onChange={(e) => setSearchAddr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="0x..."
              className="bg-mibe-bg border border-mibe-border rounded px-2.5 py-1 text-xs text-white w-48 focus:border-mibe-gold focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-mibe-gold/15 text-mibe-gold hover:bg-mibe-gold/25 transition-colors"
            >
              Go
            </button>
            {focusedAddr && (
              <button
                onClick={handleClearFocus}
                className="px-2.5 py-1 rounded text-xs font-semibold bg-mibe-red/15 text-mibe-red hover:bg-mibe-red/25 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {focusedAddr && (
            <span className="text-[0.625rem] text-mibe-cyan">
              Showing {focusedAddr.slice(0, 8)}...{focusedAddr.slice(-4)} + neighbors
            </span>
          )}
          {searchAddr && !focusedAddr && searchAddr.length > 2 && (
            <span className="text-[0.625rem] text-mibe-red">Address not found</span>
          )}
        </div>
      </div>

      {/* Stats (based on all filtered, not display-limited) */}
      <BubbleMapStats nodes={allFilteredNodes} links={allFilteredLinks} totalNodes={data.nodes.length} totalLinks={data.links.length} />

      {/* Display limit notice */}
      {isLimited && (
        <div className="text-[0.6875rem] text-mibe-text-2 bg-white/5 rounded px-3 py-1.5">
          Showing top {DISPLAY_LIMIT} wallets in graph (out of {allFilteredNodes.length}). Use address search or tier filters to refine.
        </div>
      )}

      {/* Graph */}
      <ForceGraph nodes={filteredNodes} links={filteredLinks} highlightAddress={focusedAddr} />
    </div>
  )
}

const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  dolphin: '#ff69b4',
  shark: '#58a6ff',
  fish: '#3fb950',
  shrimp: '#555',
}
