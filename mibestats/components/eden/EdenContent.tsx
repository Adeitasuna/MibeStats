'use client'

import { useEffect, useMemo, useState } from 'react'
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
  }
  grailStats: {
    grails: number
    nonGrails: number
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
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-mibe-gold">{label}</span>
      <div className="stat-card stat-card--gold">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-mibe-gold">{label}</span>
      <div className="stat-card">
        <span className="text-lg font-bold text-white">{value}</span>
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
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">Floor Price</h3>
        <div className="flex gap-1">
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                range === r
                  ? 'bg-mibe-gold/15 text-mibe-gold'
                  : 'text-mibe-text-2 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-mibe-muted text-sm">
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
  )
}

/* ── Pie chart ── */

function EdenPie({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-mibe-gold mb-3 uppercase tracking-wider">{title}</h3>
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
  )
}

/* ── Main Component ── */

export function EdenContent() {
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [floorHistory, setFloorHistory] = useState<FloorSnapshot[]>([])
  const [eden, setEden] = useState<EdenApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Compute today's lowest/highest sale (must be before any early return to respect hooks rules)
  const { lowestOfDay, highestOfDay } = useMemo(() => {
    if (!eden) return { lowestOfDay: null, highestOfDay: null }
    const today = new Date().toISOString().slice(0, 10)
    const todaySales = eden.bestSales.filter((s) => s.soldAt.slice(0, 10) === today)
    if (todaySales.length === 0) return { lowestOfDay: null, highestOfDay: null }
    return {
      lowestOfDay: Math.min(...todaySales.map((s) => s.priceBera)),
      highestOfDay: Math.max(...todaySales.map((s) => s.priceBera)),
    }
  }, [eden])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Row 1 skeleton: 4 gold cards */}
        <div id="skel-row1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`g${i}`} className="animate-pulse"><div className="h-3 bg-white/10 rounded w-20 mb-1.5" /><div className="stat-card stat-card--gold"><div className="h-7 bg-white/10 rounded w-32" /></div></div>
          ))}
        </div>
        {/* Row 2 skeleton: 6 cards */}
        <div id="skel-row2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`s${i}`} className="animate-pulse"><div className="h-2.5 bg-white/5 rounded w-20 mb-1.5" /><div className="stat-card"><div className="h-5 bg-white/5 rounded w-16" /></div></div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 768px) {
            #skel-row1 { grid-template-columns: repeat(4, 1fr) !important; }
            #skel-row2 { grid-template-columns: repeat(6, 1fr) !important; }
          }
        `}} />
        {/* Chart skeleton */}
        <div className="card p-4 animate-pulse"><div className="h-4 bg-white/5 rounded w-24 mb-4" /><div className="h-[200px] bg-white/5 rounded" /></div>
        {/* Tables skeleton */}
        <div className="card p-6 animate-pulse"><div className="h-4 bg-white/5 rounded w-48 mb-4" /><div className="h-40 bg-white/5 rounded" /></div>
      </div>
    )
  }

  // Prepare pie data
  const grailPieData = eden ? [
    { name: `Grails (${eden.grailStats.grails})`, value: eden.grailStats.grails },
    { name: `Standard (${eden.grailStats.nonGrails})`, value: eden.grailStats.nonGrails },
  ] : []

  const salesDistPie = eden
    ? eden.salesDistribution
        .filter((d) => d.saleCount > 0)
        .map((d) => ({ name: d.saleCount === 1 ? '1 sale' : `${d.saleCount} sales`, value: d.tokenCount }))
        .slice(0, 8)
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div className="card p-3 border-mibe-red text-red-400 text-sm">{error}</div>
      )}

      {/* Row 1: Floor Price | Max Sell Price | Lowest of Day | Highest of Day */}
      <div id="eden-row1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        <GoldCard label="Floor Price (7d)" value={fmt(collection?.floorPrice)} />
        <GoldCard label="Max Sell Price (ATH)" value={eden && eden.bestSales.length > 0 ? fmt(eden.bestSales[0].priceBera) : '—'} />
        <GoldCard label="Lowest Sale of Day" value={lowestOfDay != null ? fmt(lowestOfDay) : '—'} />
        <GoldCard label="Highest Sale of Day" value={highestOfDay != null ? fmt(highestOfDay) : '—'} />
      </div>

      {/* Row 2: Sales Count 1d|7d|All + Sales Volume 1d|7d|All */}
      <div id="eden-row2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <MiniCard label="Sales Count — 1d" value={eden ? String(eden.salesStats.count1d) : '—'} />
        <MiniCard label="Sales Count — 7d" value={eden ? String(eden.salesStats.count7d) : '—'} />
        <MiniCard label="Sales Count — All" value={eden ? fmtShort(eden.salesStats.countAll) : '—'} />
        <MiniCard label="Sales Vol. — 1d" value={eden ? fmt(eden.salesStats.volume1d, 1) : '—'} />
        <MiniCard label="Sales Vol. — 7d" value={eden ? fmt(eden.salesStats.volume7d, 1) : '—'} />
        <MiniCard label="Sales Vol. — All" value={fmt(collection?.volumeAllTime, 1)} />
      </div>

      {/* Responsive grid override for desktop */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          #eden-row1 { grid-template-columns: repeat(4, 1fr) !important; }
          #eden-row2 { grid-template-columns: repeat(6, 1fr) !important; }
          #eden-pies { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}} />

      {/* Row 3: Floor price chart */}
      <FloorChart data={floorHistory} />

      {/* Row 4: Pie charts */}
      {eden && (
        <div id="eden-pies" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <EdenPie data={grailPieData} title="Diamond per Mibera (Grails)" />
          <EdenPie data={salesDistPie} title="Nb Sales per Mibera" />
        </div>
      )}

      {/* Row 5: Best Sales Top 30 */}
      {eden && eden.bestSales.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-mibe-border">
            <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">
              Best Sales — Top 30
            </h3>
          </div>
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mibe-border text-[10px] text-mibe-text-2 uppercase tracking-wider">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Grail</th>
                  <th className="p-3 text-right">Price (BERA)</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {eden.bestSales.map((sale, i) => (
                  <tr key={sale.id} className="border-b border-mibe-border/30 hover:bg-mibe-hover/30 transition-colors">
                    <td className="p-3 text-mibe-muted">{i + 1}</td>
                    <td className="p-2">
                      {sale.imageUrl ? (
                        <Image src={sale.imageUrl} alt={`#${sale.tokenId}`} width={32} height={32} className="rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-mibe-hover" />
                      )}
                    </td>
                    <td className="p-3">
                      <a href={sale.magicEdenUrl} target="_blank" rel="noreferrer" className="text-mibe-cyan hover:underline">#{sale.tokenId}</a>
                    </td>
                    <td className="p-3">{sale.swagRank && <SwagRankBadge rank={sale.swagRank} size="sm" />}</td>
                    <td className="p-3">
                      {sale.isGrail ? (
                        <span className="text-mibe-gold text-xs font-bold">{sale.grailName ?? 'Yes'}</span>
                      ) : (
                        <span className="text-mibe-muted">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-medium text-white tabular-nums">{sale.priceBera.toFixed(2)}</td>
                    <td className="p-3 text-mibe-text-2 text-xs">{new Date(sale.soldAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 6: Most Sold Miberas */}
      {eden && eden.mostSold.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-mibe-border">
            <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">
              Most Sold Miberas
            </h3>
          </div>
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mibe-border text-[10px] text-mibe-text-2 uppercase tracking-wider">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-center">Sales</th>
                  <th className="p-3 text-right">Max Price</th>
                  <th className="p-3 text-right">Last Price</th>
                </tr>
              </thead>
              <tbody>
                {eden.mostSold.map((token, i) => (
                  <tr key={token.tokenId} className="border-b border-mibe-border/30 hover:bg-mibe-hover/30 transition-colors">
                    <td className="p-3 text-mibe-muted">{i + 1}</td>
                    <td className="p-2">
                      {token.imageUrl ? (
                        <Image src={token.imageUrl} alt={`#${token.tokenId}`} width={32} height={32} className="rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-mibe-hover" />
                      )}
                    </td>
                    <td className="p-3">
                      <a href={token.magicEdenUrl} target="_blank" rel="noreferrer" className="text-mibe-cyan hover:underline">#{token.tokenId}</a>
                    </td>
                    <td className="p-3"><SwagRankBadge rank={token.swagRank} size="sm" /></td>
                    <td className="p-3 text-center">
                      <span className="bg-mibe-gold/15 text-mibe-gold px-2 py-0.5 rounded text-xs font-bold">{token.saleCount}</span>
                    </td>
                    <td className="p-3 text-right font-medium text-white tabular-nums">{token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}</td>
                    <td className="p-3 text-right text-mibe-text-2 tabular-nums">{token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
