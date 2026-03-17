'use client'

import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { MostSoldItem } from './EdenTypes'

export function MostSoldTable({ mostSold, onImageClick }: { mostSold: MostSoldItem[]; onImageClick: (url: string | null) => void }) {
  if (mostSold.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">Most Sold Miberas — Top 30</span>
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Img</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rank</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Sales</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Transfers</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Max</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Last</th>
              </tr>
            </thead>
            <tbody>
              {mostSold.map((token, i) => (
                <tr key={token.tokenId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#555' }}>{i + 1}</td>
                  <td style={{ padding: '0.35rem' }}>
                    {token.imageUrl ? (
                      <Image src={token.imageUrl} alt={`#${token.tokenId}`} width={48} height={48} className="rounded object-cover shrink-0" style={{ cursor: 'pointer' }} onClick={() => onImageClick(token.imageUrl)} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '0.25rem', background: '#1a1a1a' }} />
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <a href={token.openSeaUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>#{token.tokenId}</a>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}><SwagRankBadge rank={token.swagRank} size="sm" /></td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>{token.saleCount}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{token.transferCount}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 500, color: '#fff' }}>{token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#888' }}>{token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
