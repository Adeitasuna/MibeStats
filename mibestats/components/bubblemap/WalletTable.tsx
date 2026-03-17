'use client'

import type { BubbleMapNode } from '@/types'
import { DEFAULT_PAGE_SIZE } from './bubblemap-constants'

interface WalletTableProps {
  sortedWallets: BubbleMapNode[]
  focusedAddr: string | null
  onNodeFocus: (address: string) => void
  page: number
  setPage: (fn: (p: number) => number) => void
  tierColors: Record<string, string>
}

export function WalletTable({ sortedWallets, focusedAddr, onNodeFocus, page, setPage, tierColors }: WalletTableProps) {
  const totalPages = Math.ceil(sortedWallets.length / DEFAULT_PAGE_SIZE)
  const pagedWallets = sortedWallets.slice(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE)

  return (
    <div style={{ gridColumn: '1 / 4', gridRow: '2 / 4', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">
        Wallets by NFT Count
      </span>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.25rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}>
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <table style={{ width: '100%', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                <th style={{ padding: '0.375rem 0.5rem', textAlign: 'left', width: 30 }}>#</th>
                <th style={{ padding: '0.375rem 0.5rem', textAlign: 'left' }}>Address</th>
                <th style={{ padding: '0.375rem 0.5rem', textAlign: 'right', width: 50 }}>NFTs</th>
                <th style={{ padding: '0.375rem 0.5rem', textAlign: 'right', width: 70 }}>Tier</th>
              </tr>
            </thead>
            <tbody>
              {pagedWallets.map((w, i) => (
                <tr
                  key={w.id}
                  onClick={() => onNodeFocus(w.id)}
                  style={{
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: focusedAddr === w.id ? 'rgba(255,215,0,0.12)' : undefined,
                  }}
                  className="hover:bg-white/10"
                >
                  <td style={{ padding: '0.25rem 0.5rem', color: '#555' }}>{page * DEFAULT_PAGE_SIZE + i + 1}</td>
                  <td style={{ padding: '0.25rem 0.5rem', fontFamily: 'monospace', fontSize: '0.6875rem', color: '#ccc', wordBreak: 'break-all' }}>{w.id}</td>
                  <td style={{ padding: '0.25rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>{w.count}</td>
                  <td style={{ padding: '0.25rem 0.5rem', textAlign: 'right', textTransform: 'capitalize', color: tierColors[w.tier] }}>{w.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0, fontSize: '0.5625rem', color: '#888',
          }}>
            <span>{sortedWallets.length} wallets</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              <span>{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
