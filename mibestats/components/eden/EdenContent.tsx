'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'

/* ── Types ── */

interface CollectionData {
  floorPrice: number | null
  volume24h: number | null
  volume7d: number | null
  volume30d: number | null
  volumeAllTime: number | null
  totalSales: number | null
  totalHolders: number | null
}

interface FloorSnapshot {
  date: string
  floorPrice: number
}

interface BestSale {
  id: string
  tokenId: number
  priceBera: number
  soldAt: string
  imageUrl: string | null
  swagRank: string | null
  isGrail: boolean
  grailName: string | null
  magicEdenUrl: string
}

interface SalesDistItem {
  saleCount: number
  tokenCount: number
}

interface MostSoldItem {
  tokenId: number
  saleCount: number
  transferCount: number
  imageUrl: string | null
  swagRank: string
  isGrail: boolean
  grailName: string | null
  maxSalePrice: number | null
  lastSalePrice: number | null
  magicEdenUrl: string
}

interface EdenApiData {
  bestSales: BestSale[]
  salesDistribution: SalesDistItem[]
  mostSold: MostSoldItem[]
  salesStats: {
    count1d: number
    count7d: number
    countAll: number
    volume1d: number
    volume7d: number
    volumeAll: number
    lowestSale24h: number | null
    highestSale24h: number | null
  }
  grailStats: {
    grails: number
    nonGrails: number
    burned: number
  }
}

/* ── Helpers ── */

const PIE_COLORS = ['#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149', '#bc8cff', '#f0883e', '#8b949e']

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—'
  return `${value.toFixed(decimals)} BERA`
}

function fmtShort(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString()
}

type Range = '7d' | '30d' | 'all'

/* ── Stat cards ── */

function GoldCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>{label}</span>
      <div className="stat-card stat-card--gold">
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{value}</span>
      </div>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>{label}</span>
      <div className="stat-card">
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{value}</span>
      </div>
    </div>
  )
}

/* ── Floor Price Chart ── */

function FloorChart({ data }: { data: FloorSnapshot[] }) {
  const [range, setRange] = useState<Range>('30d')

  const now = Date.now()
  const cutoffs: Record<Range, number> = {
    '7d': now - 7 * 86400000,
    '30d': now - 30 * 86400000,
    'all': 0,
  }

  const filtered = data
    .filter((d) => new Date(d.date).getTime() >= cutoffs[range])
    .map((d) => ({ date: d.date, price: Number(d.floorPrice.toFixed(4)) }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>Floor Price</span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                background: range === r ? 'rgba(255,215,0,0.15)' : 'transparent',
                color: range === r ? '#ffd700' : '#8b949e',
              }}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>
      <div className="stat-card" style={{ padding: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.875rem' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="floorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd700" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8b949e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fill: '#8b949e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}`}
                width={45}
              />
              <Tooltip
                contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, fontSize: 12, color: '#e6edf3' }}
                labelStyle={{ color: '#8b949e' }}
                formatter={(v: number) => [`${v} BERA`, 'Floor']}
              />
              <Area type="monotone" dataKey="price" stroke="#ffd700" strokeWidth={2} fill="url(#floorGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

/* ── Pie chart ── */

function EdenPie({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>{title}</span>
      <div className="stat-card" style={{ padding: '0.75rem' }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, fontSize: 12, color: '#e6edf3' }}
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Main Component ── */

export function EdenContent() {
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [floorHistory, setFloorHistory] = useState<FloorSnapshot[]>([])
  const [eden, setEden] = useState<EdenApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/collection').then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/stats/floor-history?range=all').then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/eden').then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([col, history, edenData]) => {
      if (col) setCollection(col)
      if (history) setFloorHistory(history)
      if (edenData) setEden(edenData)
      if (!col && !edenData) setError('Failed to load data')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
      </div>
    )
  }

  // Prepare pie data
  const nftStatusPie = eden ? [
    { name: `Standard (${eden.grailStats.nonGrails})`, value: eden.grailStats.nonGrails },
    { name: `Grail (${eden.grailStats.grails})`, value: eden.grailStats.grails },
    ...(eden.grailStats.burned > 0 ? [{ name: `Burned (${eden.grailStats.burned})`, value: eden.grailStats.burned }] : []),
  ] : []

  const salesDistPie = eden
    ? eden.salesDistribution
        .filter((d) => d.saleCount > 0)
        .map((d) => ({ name: d.saleCount === 1 ? '1 sale' : `${d.saleCount} sales`, value: d.tokenCount }))
        .slice(0, 8)
    : []

  // Diamond Mibera: never sold vs at least 1 sale
  const diamondMiberaPie = eden ? (() => {
    const totalCollection = eden.grailStats.grails + eden.grailStats.nonGrails
    const soldCount = eden.salesDistribution
      .filter((d) => d.saleCount > 0)
      .reduce((sum, d) => sum + d.tokenCount, 0)
    const neverSold = totalCollection - soldCount
    return [
      { name: `Never sold (${neverSold})`, value: neverSold },
      { name: `Sold (${soldCount})`, value: soldCount },
    ]
  })() : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div className="card p-3 border-mibe-red text-red-400 text-sm">{error}</div>
      )}

      {/* Row 1: Floor Price | Max Sell Price | Lowest of Day | Highest of Day */}
      <div id="eden-row1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        <GoldCard label="Floor Price (7d)" value={fmt(collection?.floorPrice)} />
        <GoldCard label="Max Sell Price (ATH)" value={eden && eden.bestSales.length > 0 ? fmt(eden.bestSales[0].priceBera) : '—'} />
        <GoldCard label="Lowest Sale (24h)" value={eden?.salesStats.lowestSale24h != null ? fmt(eden.salesStats.lowestSale24h) : '—'} />
        <GoldCard label="Highest Sale (24h)" value={eden?.salesStats.highestSale24h != null ? fmt(eden.salesStats.highestSale24h) : '—'} />
      </div>

      {/* Rows 2-3: Sales cards (cols 1-3) + Floor chart (cols 4-6 spanning 2 rows) */}
      <div id="eden-stats-chart" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {/* Row 2 cols 1-3: Sales Count */}
        <MiniCard label="Sales Count — 1d" value={eden ? String(eden.salesStats.count1d) : '—'} />
        <MiniCard label="Sales Count — 7d" value={eden ? String(eden.salesStats.count7d) : '—'} />
        <MiniCard label="Sales Count — All" value={eden ? fmtShort(eden.salesStats.countAll) : '—'} />
        {/* Floor chart spanning cols 4-6, rows 1-2 (positioned via CSS) */}
        <div id="eden-floor-chart" style={{ gridColumn: '1 / -1' }}>
          <FloorChart data={floorHistory} />
        </div>
        {/* Row 3 cols 1-3: Sales Volume */}
        <MiniCard label="Sales Vol. — 1d" value={eden ? fmt(eden.salesStats.volume1d, 1) : '—'} />
        <MiniCard label="Sales Vol. — 7d" value={eden ? fmt(eden.salesStats.volume7d, 1) : '—'} />
        <MiniCard label="Sales Vol. — All" value={eden ? fmt(eden.salesStats.volumeAll, 1) : '—'} />
      </div>

      {/* Responsive: on desktop, 6 cols with chart spanning cols 4-6 and rows 1-2 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          #eden-row1 { grid-template-columns: repeat(4, 1fr) !important; }
          #eden-stats-chart {
            grid-template-columns: repeat(6, 1fr) !important;
            grid-template-rows: auto auto !important;
          }
          #eden-floor-chart {
            grid-column: 4 / 7 !important;
            grid-row: 1 / 3 !important;
          }
          #eden-pies { grid-template-columns: repeat(3, 1fr) !important; }
          #eden-tables { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}} />

      {/* Row 4: 3 Pie charts */}
      {eden && (
        <div id="eden-pies" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <EdenPie data={nftStatusPie} title="NFT Status" />
          <EdenPie data={salesDistPie} title="Nb Sales per Mibera" />
          <EdenPie data={diamondMiberaPie} title="Diamond Mibera" />
        </div>
      )}

      {/* Row 5: Best Sales (cols 1-3) | Most Sold (cols 4-6) */}
      {eden && (
        <div id="eden-tables" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {/* Best Sales */}
          {eden.bestSales.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>Best Sales — Top 30</span>
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
                      {eden.bestSales.map((sale, i) => (
                        <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#555' }}>{i + 1}</td>
                          <td style={{ padding: '0.35rem' }}>
                            {sale.imageUrl ? (
                              <Image src={sale.imageUrl} alt={`#${sale.tokenId}`} width={48} height={48} className="rounded object-cover shrink-0" style={{ cursor: 'pointer' }} onClick={() => setLightboxUrl(sale.imageUrl)} />
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
          )}

          {/* Most Sold */}
          {eden.mostSold.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700' }}>Most Sold Miberas — Top 30</span>
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
                      {eden.mostSold.map((token, i) => (
                        <tr key={token.tokenId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#555' }}>{i + 1}</td>
                          <td style={{ padding: '0.35rem' }}>
                            {token.imageUrl ? (
                              <Image src={token.imageUrl} alt={`#${token.tokenId}`} width={48} height={48} className="rounded object-cover shrink-0" style={{ cursor: 'pointer' }} onClick={() => setLightboxUrl(token.imageUrl)} />
                            ) : (
                              <div style={{ width: 48, height: 48, borderRadius: '0.25rem', background: '#1a1a1a' }} />
                            )}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <a href={token.magicEdenUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>#{token.tokenId}</a>
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
          )}
        </div>
      )}

      {/* Lightbox modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <img
            src={lightboxUrl}
            alt="Enlarged"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '0.5rem', imageRendering: 'pixelated' }}
          />
        </div>
      )}
    </div>
  )
}
