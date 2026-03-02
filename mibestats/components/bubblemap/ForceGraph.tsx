'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import { useRouter } from 'next/navigation'
import type { BubbleMapNode, BubbleMapLink } from '@/types'

/* ── Tier colors ── */

const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  dolphin: '#ff69b4',
  shark: '#58a6ff',
  fish: '#3fb950',
  shrimp: '#555',
}

/* ── Graph object types (library injects d3 position fields at runtime) ── */

type GraphNode = BubbleMapNode & { x?: number; y?: number }
type GraphLink = BubbleMapLink & { [k: string]: unknown }

/* ── Helpers ── */

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
  highlightAddress?: string | null
}

export function ForceGraph({ nodes, links, highlightAddress }: Props) {
  const router = useRouter()
  const graphRef = useRef<ForceGraphMethods>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Memoize graph data to prevent recreation on every render
  const graphData = useMemo(() => ({
    nodes: nodes.map((n) => ({ ...n })),
    links: links.map((l) => ({ ...l })),
  }), [nodes, links])

  // Resize observer
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

  // Zoom to fit when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 40)
    }, 500)
    return () => clearTimeout(timer)
  }, [nodes, links])

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.id) router.push(`/portfolio?address=${node.id}`)
    },
    [router],
  )

  // Custom canvas node rendering — colored bubble, info in tooltip on hover
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const x = node.x ?? 0
    const y = node.y ?? 0
    const r = nodeRadius(node.count)
    const color = TIER_COLORS[node.tier] ?? '#555'
    const isHighlighted = highlightAddress === node.id

    // Bubble fill
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = isHighlighted ? color : highlightAddress ? `${color}44` : color
    ctx.fill()

    // Border for highlighted node
    if (isHighlighted) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    // Truncated address below bubble (only at sufficient zoom)
    if (globalScale > 0.7) {
      const labelSize = Math.max(3, 8 / globalScale)
      ctx.font = `${labelSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isHighlighted ? '#fff' : '#888'
      ctx.fillText(truncAddr(node.id), x, y + r + labelSize + 1)
    }
  }, [highlightAddress])

  // Hit area for hover/click detection
  const paintNodeArea = useCallback((node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
    const x = node.x ?? 0
    const y = node.y ?? 0
    const r = nodeRadius(node.count)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
  }, [])

  const nodeLabel = useCallback((node: GraphNode) => `${truncAddr(node.id)} | ${node.count} NFTs | ${node.tier}`, [])
  const linkColor = useCallback((link: GraphLink) => link.bidirectional ? '#f85149' : '#333', [])
  const linkWidth = useCallback((link: GraphLink) => Math.min(Math.sqrt(link.weight) * 1.5, 6), [])
  const arrowColor = useCallback((link: GraphLink) => link.bidirectional ? '#f85149' : '#555', [])

  return (
    <div ref={containerRef} className="stat-card p-0 overflow-hidden relative" role="img" aria-label="Wallet relationship graph">
      {/* Legend — left side */}
      <ul className="absolute top-2 left-2 z-10 bg-black/70 rounded-md px-2.5 py-1.5 text-[0.6875rem] flex flex-col gap-0.5 list-none m-0">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <li key={tier} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: color }} />
            <span className="text-gray-300 capitalize">{tier}</span>
          </li>
        ))}
        <li className="flex items-center gap-1.5 mt-0.5 pt-1 border-t border-gray-700">
          <span className="w-3 h-0.5 inline-block shrink-0 bg-mibe-red" />
          <span className="text-gray-300">Bidirectional</span>
        </li>
      </ul>

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
