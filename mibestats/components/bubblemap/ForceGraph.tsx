'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import type { BubbleMapNode, BubbleMapLink } from '@/types'
import { TIER_COLORS } from '@/lib/chart-constants'

/* ── Constants ── */

const TIER_LEGEND = [
  { tier: 'whale', color: '#ffd700', label: 'Whale (100+)' },
  { tier: 'diamond', color: '#b9f2ff', label: 'Diamond (35-99)' },
  { tier: 'gold', color: '#f0a030', label: 'Gold (10-34)' },
  { tier: 'silver', color: '#c0c0c0', label: 'Silver (4-9)' },
  { tier: 'bronze', color: '#cd7f32', label: 'Bronze (2-3)' },
  { tier: 'holder', color: '#555', label: 'Holder (1)' },
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
    // Sort descending by count so big bubbles paint first (behind small ones)
    nodes: [...nodes].sort((a, b) => b.count - a.count).map((n) => ({ ...n })),
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

    // Light contour on all visible bubbles
    if (!isDimmed) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // White border for focused node (overwrites subtle stroke)
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
    return link.bidirectional ? '#ff4444' : 'rgba(255,255,255,0.6)'
  }, [connectedLinkKeys])

  const linkWidth = useCallback((link: GraphLink) => {
    if (connectedLinkKeys) {
      const key = `${typeof link.source === 'object' ? (link.source as GraphNode).id : link.source}→${typeof link.target === 'object' ? (link.target as GraphNode).id : link.target}`
      if (!connectedLinkKeys.has(key)) return 0.3
    }
    return link.bidirectional
      ? Math.max(2, Math.min(Math.sqrt(link.weight) * 3, 10))
      : Math.max(1, Math.min(Math.sqrt(link.weight) * 1.5, 4))
  }, [connectedLinkKeys])

  const arrowColor = useCallback((link: GraphLink) => {
    return link.bidirectional ? '#ff4444' : 'rgba(255,255,255,0.6)'
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden', background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.25rem' }} role="img" aria-label="Wallet relationship graph">
      {/* Legend — compact overlay */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '6px 8px', fontSize: 10, lineHeight: '16px', fontFamily: 'sans-serif' }}>
        {TIER_LEGEND.map(({ tier, color, label }) => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, backgroundColor: color }} />
            <span style={{ color: '#ccc' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, paddingTop: 3, borderTop: '1px solid #444' }}>
          <span style={{ width: 14, height: 3, backgroundColor: '#ff4444', display: 'inline-block', borderRadius: 1, flexShrink: 0 }} />
          <span style={{ color: '#ccc' }}>Bidirectional</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 2, backgroundColor: 'rgba(255,255,255,0.6)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#ccc' }}>One-way</span>
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
