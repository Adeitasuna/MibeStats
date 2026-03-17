'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BubbleMapNode, BubbleMapLink, BubbleMapResponse } from '@/types'
import {
  TIER_COLORS, TIER_LABELS, TIER_ORDER, DISPLAY_LIMIT,
} from './bubblemap-constants'

export function useBubbleMapData(activeTiers: Set<string>, focusedAddr: string | null) {
  const [data, setData] = useState<BubbleMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Filter and compute all stats
  const {
    graphNodes, graphLinks,
    allFilteredNodes, allFilteredLinks,
    walletCount, transferCount, bidirectionalPairs,
    tierData, nftByTierData, nftDistData, totalNfts, sortedWallets,
  } = useMemo(() => {
    if (!data) return {
      graphNodes: [] as BubbleMapNode[], graphLinks: [] as BubbleMapLink[],
      allFilteredNodes: [] as BubbleMapNode[], allFilteredLinks: [] as BubbleMapLink[],
      walletCount: 0, transferCount: 0, bidirectionalPairs: 0,
      tierData: [] as { name: string; value: number; color: string }[],
      nftByTierData: [] as { name: string; value: number; color: string }[],
      nftDistData: [] as { name: string; value: number }[],
      totalNfts: 0,
      sortedWallets: [] as BubbleMapNode[],
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
      tierData, nftByTierData, nftDistData, totalNfts, sortedWallets: sorted,
    }
  }, [data, activeTiers, focusedAddr])

  return {
    data, loading, error, fetchData,
    graphNodes, graphLinks,
    allFilteredNodes, allFilteredLinks,
    walletCount, transferCount, bidirectionalPairs,
    tierData, nftByTierData, nftDistData, totalNfts, sortedWallets,
  }
}
