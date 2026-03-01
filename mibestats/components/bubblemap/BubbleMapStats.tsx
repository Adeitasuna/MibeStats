'use client'

import type { BubbleMapNode, BubbleMapLink } from '@/types'

interface Props {
  nodes: BubbleMapNode[]
  links: BubbleMapLink[]
}

export function BubbleMapStats({ nodes, links }: Props) {
  const totalWallets = nodes.length
  const totalConnections = links.length
  const bidirectionalPairs = links.filter((l) => l.bidirectional).length / 2
  const topHolders = [...nodes].sort((a, b) => b.count - a.count).slice(0, 5)

  const tierCounts = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.tier] = (acc[n.tier] ?? 0) + 1
    return acc
  }, {})

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
      <StatCard label="Wallets" value={totalWallets.toLocaleString()} />
      <StatCard label="Connections" value={totalConnections.toLocaleString()} />
      <StatCard label="Bidirectional Pairs" value={Math.floor(bidirectionalPairs).toLocaleString()} color="#f85149" />
      <StatCard
        label="By Tier"
        value={
          ['whale', 'dolphin', 'shark', 'fish', 'shrimp']
            .filter((t) => tierCounts[t])
            .map((t) => `${t}: ${tierCounts[t]}`)
            .join(' / ')
        }
      />

      {/* Top holders row */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>
            Top Holders
          </span>
          <div className="stat-card" style={{ padding: '0.5rem 0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
              {topHolders.map((h, i) => (
                <span key={h.id} style={{ color: i === 0 ? '#ffd700' : '#ccc' }}>
                  {h.id.slice(0, 6)}...{h.id.slice(-4)}: <strong>{h.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          #bubblemap-stats { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: color ?? '#ffd700' }}>
        {label}
      </span>
      <div className="stat-card">
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{value}</span>
      </div>
    </div>
  )
}
