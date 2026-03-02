'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import type { BubbleMapNode, BubbleMapLink } from '@/types'

/* ── Constants ── */

const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  dolphin: '#ff69b4',
  shark: '#58a6ff',
  fish: '#3fb950',
  shrimp: '#555',
}

const TIER_LEGEND = [
  { tier: 'whale', color: '#ffd700', label: 'Whale (20+ NFTs)' },
  { tier: 'dolphin', color: '#ff69b4', label: 'Dolphin (10-19)' },
  { tier: 'shark', color: '#58a6ff', label: 'Shark (5-9)' },
  { tier: 'fish', color: '#3fb950', label: 'Fish (2-4)' },
  { tier: 'shrimp', color: '#555', label: 'Shrimp (1)' },
]

type GraphNode = BubbleMapNode & { x?: number; y?: number }
type GraphLink = BubbleMapLink & { [k: string]: unknown }

function truncAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function nodeRadius(count: number) {
  return Math.sqrt(count) * 4 + 6
}

/* ── Component ── */

interface Props {
  nodes: BubbleMapNode[]
  links: BubbleMapLink[]
  focusedAddress?: string | null
  onNodeFocus?: (address: string) => void
}

export function ForceGraph({ nodes, links, focusedAddress, onNodeFocus }: Props) {
  const graphRef = useRef<ForceGraphMethods>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  const graphData = useMemo(() => ({
    nodes: nodes.map((n) => ({ ...n })),
    links: links.map((l) => ({ ...l })),
  }), [nodes, links])

  // Set of node IDs connected to focused address (for dimming)
  const connectedIds = useMemo(() => {
    if (!focusedAddress) return null
    const ids = new Set<string>()
    ids.add(focusedAddress)
    for (const l of links) {
      if (l.source === focusedAddress) ids.add(l.target)
      if (l.target === focusedAddress) ids.add(l.source)
    }
    return ids
  }, [focusedAddress, links])

  // Set of link keys connected to focused address
  const connectedLinkKeys = useMemo(() => {
    if (!focusedAddress) return null
    const keys = new Set<string>()
    for (const l of links) {
      if (l.source === focusedAddress || l.target === focusedAddress) {
        keys.add(`${l.source}→${l.target}`)
      }
    }
    return keys
  }, [focusedAddress, links])

  // Resize
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setDimensions({ width: el.clientWidth, height: Math.max(500, window.innerHeight - 300) })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Zoom to fit on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 40)
    }, 500)
    return () => clearTimeout(timer)
  }, [nodes, links])

  // Click = focus on node (toggle)
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.id && onNodeFocus) onNodeFocus(node.id)
    },
    [onNodeFocus],
  )

  // Custom node painting
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const x = node.x ?? 0
    const y = node.y ?? 0
    const r = nodeRadius(node.count)
    const color = TIER_COLORS[node.tier] ?? '#555'
    const isFocused = focusedAddress === node.id
    const isConnected = !connectedIds || connectedIds.has(node.id)
    const isDimmed = connectedIds && !isConnected

    // Bubble
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    if (isFocused) {
      ctx.fillStyle = color
    } else if (isDimmed) {
      ctx.fillStyle = `${color}18` // very faded
    } else {
      ctx.fillStyle = color
    }
    ctx.fill()

    // White border for focused node
    if (isFocused) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    // Address label at sufficient zoom
    if (globalScale > 0.7 && !isDimmed) {
      const labelSize = Math.max(3, 8 / globalScale)
      ctx.font = `${labelSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isFocused ? '#fff' : '#888'
      ctx.fillText(truncAddr(node.id), x, y + r + labelSize + 1)
    }
  }, [focusedAddress, connectedIds])

  // Hit area
  const paintNodeArea = useCallback((node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
    const x = node.x ?? 0
    const y = node.y ?? 0
    ctx.beginPath()
    ctx.arc(x, y, nodeRadius(node.count), 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
  }, [])

  const nodeLabel = useCallback((node: GraphNode) => `${truncAddr(node.id)} | ${node.count} NFTs | ${node.tier}`, [])

  // Link styling — bidirectional = red & thicker, one-way = gray
  const linkColor = useCallback((link: GraphLink) => {
    if (connectedLinkKeys) {
      const key = `${typeof link.source === 'object' ? (link.source as GraphNode).id : link.source}→${typeof link.target === 'object' ? (link.target as GraphNode).id : link.target}`
      if (!connectedLinkKeys.has(key)) return 'rgba(255,255,255,0.03)' // nearly invisible
    }
    return link.bidirectional ? '#ff6b6b' : 'rgba(255,255,255,0.35)'
  }, [connectedLinkKeys])

  const linkWidth = useCallback((link: GraphLink) => {
    if (connectedLinkKeys) {
      const key = `${typeof link.source === 'object' ? (link.source as GraphNode).id : link.source}→${typeof link.target === 'object' ? (link.target as GraphNode).id : link.target}`
      if (!connectedLinkKeys.has(key)) return 0.2
    }
    return link.bidirectional
      ? Math.min(Math.sqrt(link.weight) * 3, 10)
      : Math.min(Math.sqrt(link.weight) * 1.5, 4)
  }, [connectedLinkKeys])

  const arrowColor = useCallback((link: GraphLink) => {
    return link.bidirectional ? '#ff6b6b' : 'rgba(255,255,255,0.4)'
  }, [])

  return (
    <div ref={containerRef} className="stat-card p-0 overflow-hidden relative" role="img" aria-label="Wallet relationship graph">
      {/* Legend — left side */}
      <div className="absolute top-2 left-2 z-10 bg-black/80 rounded-md px-2.5 py-2 text-[0.6875rem] flex flex-col gap-1">
        {TIER_LEGEND.map(({ tier, color, label }) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-300">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-700">
          <span className="shrink-0" style={{ width: 14, height: 3, backgroundColor: '#ff6b6b', display: 'inline-block', borderRadius: 1 }} />
          <span className="text-gray-300">Bidirectional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="shrink-0" style={{ width: 14, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
          <span className="text-gray-300">One-way</span>
        </div>
      </div>

      <ForceGraph2D
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={graphRef as any}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0d1117"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        nodePointerAreaPaint={paintNodeArea}
        nodeLabel={nodeLabel}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkCurvature={0.15}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={arrowColor}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        enableNodeDrag={true}
      />
    </div>
  )
}
