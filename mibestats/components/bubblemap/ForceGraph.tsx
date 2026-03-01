'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

/* ── Helpers ── */

function truncAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/* ── Component ── */

interface Props {
  nodes: BubbleMapNode[]
  links: BubbleMapLink[]
}

export function ForceGraph({ nodes, links }: Props) {
  const router = useRouter()
  const graphRef = useRef<ForceGraphMethods>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

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

  // Zoom to fit after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 40)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const graphData = {
    nodes: nodes.map((n) => ({ ...n })),
    links: links.map((l) => ({ ...l })),
  }

  const handleNodeClick = useCallback(
    (node: { id?: string | number }) => {
      if (node.id) router.push(`/portfolio?address=${node.id}`)
    },
    [router],
  )

  return (
    <div ref={containerRef} className="stat-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Legend */}
      <div style={{
        position: 'absolute', top: 8, right: 8, zIndex: 10,
        background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '6px 10px',
        fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color: '#ccc', textTransform: 'capitalize' }}>{tier}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, borderTop: '1px solid #333', paddingTop: 3 }}>
          <span style={{ width: 12, height: 2, background: '#f85149', display: 'inline-block' }} />
          <span style={{ color: '#ccc' }}>Bidirectional</span>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0d1117"
        nodeVal={(node) => Math.sqrt((node as BubbleMapNode).count) * 3}
        nodeColor={(node) => TIER_COLORS[(node as BubbleMapNode).tier] ?? '#555'}
        nodeLabel={(node) => {
          const n = node as BubbleMapNode
          return `${truncAddr(n.id)} | ${n.count} NFTs | ${n.tier}`
        }}
        linkColor={(link) => (link as BubbleMapLink).bidirectional ? '#f85149' : '#333'}
        linkWidth={(link) => Math.min(Math.sqrt((link as BubbleMapLink).weight) * 1.5, 6)}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={(link) => (link as BubbleMapLink).bidirectional ? '#f85149' : '#555'}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        enableNodeDrag={true}
      />
    </div>
  )
}
