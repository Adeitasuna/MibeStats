'use client'

import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { BestSale } from './EdenTypes'

export function BestSalesTable({ bestSales, onImageClick }: { bestSales: BestSale[]; onImageClick: (url: string | null) => void }) {
  if (bestSales.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">Best Sales — Top 30</span>
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Img</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rank</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Grail</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bestSales.map((sale, i) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#555' }}>{i + 1}</td>
                  <td style={{ padding: '0.35rem' }}>
                    {sale.imageUrl ? (
                      <Image src={sale.imageUrl} alt={`#${sale.tokenId}`} width={48} height={48} className="rounded object-cover shrink-0" style={{ cursor: 'pointer' }} onClick={() => onImageClick(sale.imageUrl)} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '0.25rem', background: '#1a1a1a' }} />
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <a href={sale.magicEdenUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>#{sale.tokenId}</a>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{sale.swagRank && <SwagRankBadge rank={sale.swagRank} size="sm" />}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    {sale.isGrail ? (
                      <span style={{ color: '#ffd700', fontSize: '0.75rem', fontWeight: 700 }}>{sale.grailName ?? 'Yes'}</span>
                    ) : (
                      <span style={{ color: '#555' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 500, color: '#fff' }}>{sale.priceBera.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#888', fontSize: '0.75rem' }}>{new Date(sale.soldAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
