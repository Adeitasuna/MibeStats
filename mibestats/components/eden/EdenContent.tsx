'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import { FloorChart } from './FloorChart'
import { EdenPie } from './EdenPie'
import type { CollectionData, FloorSnapshot, EdenApiData } from './eden-types'

/* ── Helpers ── */

function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—'
  return `${value.toFixed(decimals)} BERA`
}

function fmtShort(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString()
}

/* ── Stat cards ── */

function GoldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="card-title-upper">{label}</span>
      <div className="stat-card stat-card--gold">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="card-title-upper">{label}</span>
      <div className="stat-card">
        <span className="text-lg font-bold text-white">{value}</span>
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
    const controller = new AbortController()
    Promise.all([
      fetch('/api/collection', { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch((e) => { if (e.name === 'AbortError') throw e; return null }),
      fetch('/api/stats/floor-history?range=all', { signal: controller.signal }).then((r) => r.ok ? r.json() : []).catch((e) => { if (e.name === 'AbortError') throw e; return [] }),
      fetch('/api/eden', { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch((e) => { if (e.name === 'AbortError') throw e; return null }),
    ]).then(([col, history, edenData]) => {
      if (col) setCollection(col)
      if (history) setFloorHistory(history)
      if (edenData) setEden(edenData)
      if (!col && !edenData) setError('Failed to load data')
      setLoading(false)
    }).catch((err) => {
      if (err.name !== 'AbortError') setLoading(false)
    })
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <img src="/waiting.gif" alt="Loading..." className="max-w-[300px]" style={{ imageRendering: 'pixelated' }} />
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
    <div className="flex flex-col gap-5">
      {error && (
        <div className="card p-3 border-mibe-red text-red-400 text-sm">{error}</div>
      )}

      {/* Row 1: Floor Price | Max Sell Price | Lowest of Day | Highest of Day */}
      <div id="eden-row1" className="grid grid-cols-2 gap-3">
        <GoldCard label="Floor Price (7d)" value={fmt(collection?.floorPrice)} />
        <GoldCard label="Max Sell Price (ATH)" value={eden && eden.bestSales.length > 0 ? fmt(eden.bestSales[0].priceBera) : '—'} />
        <GoldCard label="Lowest Sale (24h)" value={eden?.salesStats.lowestSale24h != null ? fmt(eden.salesStats.lowestSale24h) : '—'} />
        <GoldCard label="Highest Sale (24h)" value={eden?.salesStats.highestSale24h != null ? fmt(eden.salesStats.highestSale24h) : '—'} />
      </div>

      {/* Rows 2-3: Sales cards (cols 1-3) + Floor chart (cols 4-6 spanning 2 rows) */}
      <div id="eden-stats-chart" className="grid grid-cols-3 gap-3">
        {/* Row 2 cols 1-3: Sales Count */}
        <MiniCard label="Sales Count — 1d" value={eden ? String(eden.salesStats.count1d) : '—'} />
        <MiniCard label="Sales Count — 7d" value={eden ? String(eden.salesStats.count7d) : '—'} />
        <MiniCard label="Sales Count — All" value={eden ? fmtShort(eden.salesStats.countAll) : '—'} />
        {/* Floor chart spanning cols 4-6, rows 1-2 (positioned via CSS) */}
        <div id="eden-floor-chart" className="col-span-full">
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
        <div id="eden-pies" className="grid grid-cols-1 gap-4">
          <EdenPie data={nftStatusPie} title="NFT Status" />
          <EdenPie data={salesDistPie} title="Nb Sales per Mibera" />
          <EdenPie data={diamondMiberaPie} title="Diamond Mibera" />
        </div>
      )}

      {/* Row 5: Best Sales (cols 1-3) | Most Sold (cols 4-6) */}
      {eden && (
        <div id="eden-tables" className="grid grid-cols-1 gap-4">
          {/* Best Sales */}
          {eden.bestSales.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="card-title-upper">Best Sales — Top 30</span>
              <div className="stat-card p-0 overflow-hidden">
                <div className="table-responsive">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[0.625rem] uppercase tracking-wide text-mibe-text-2">
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Img</th>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Rank</th>
                        <th className="p-3 text-left">Grail</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eden.bestSales.map((sale, i) => (
                        <tr key={sale.id} className="border-b border-white/5">
                          <td className="py-2 px-3 text-mibe-muted">{i + 1}</td>
                          <td className="p-1.5">
                            {sale.imageUrl ? (
                              <Image src={sale.imageUrl} alt={`#${sale.tokenId}`} width={48} height={48} className="rounded object-cover shrink-0 cursor-pointer" onClick={() => setLightboxUrl(sale.imageUrl)} />
                            ) : (
                              <div className="w-12 h-12 rounded bg-[#1a1a1a]" />
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <a href={sale.magicEdenUrl} target="_blank" rel="noreferrer" className="text-[#58a6ff] no-underline">#{sale.tokenId}</a>
                          </td>
                          <td className="py-2 px-3">{sale.swagRank && <SwagRankBadge rank={sale.swagRank} size="sm" />}</td>
                          <td className="py-2 px-3">
                            {sale.isGrail ? (
                              <span className="text-mibe-gold text-xs font-bold">{sale.grailName ?? 'Yes'}</span>
                            ) : (
                              <span className="text-mibe-muted">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-white">{sale.priceBera.toFixed(2)}</td>
                          <td className="py-2 px-3 text-mibe-text-2 text-xs">{new Date(sale.soldAt).toLocaleDateString()}</td>
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
            <div className="flex flex-col gap-1">
              <span className="card-title-upper">Most Sold Miberas — Top 30</span>
              <div className="stat-card p-0 overflow-hidden">
                <div className="table-responsive">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[0.625rem] uppercase tracking-wide text-mibe-text-2">
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Img</th>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Rank</th>
                        <th className="p-3 text-center">Sales</th>
                        <th className="p-3 text-center">Transfers</th>
                        <th className="p-3 text-right">Max</th>
                        <th className="p-3 text-right">Last</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eden.mostSold.map((token, i) => (
                        <tr key={token.tokenId} className="border-b border-white/5">
                          <td className="py-2 px-3 text-mibe-muted">{i + 1}</td>
                          <td className="p-1.5">
                            {token.imageUrl ? (
                              <Image src={token.imageUrl} alt={`#${token.tokenId}`} width={48} height={48} className="rounded object-cover shrink-0 cursor-pointer" onClick={() => setLightboxUrl(token.imageUrl)} />
                            ) : (
                              <div className="w-12 h-12 rounded bg-[#1a1a1a]" />
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <a href={token.magicEdenUrl} target="_blank" rel="noreferrer" className="text-[#58a6ff] no-underline">#{token.tokenId}</a>
                          </td>
                          <td className="py-2 px-3"><SwagRankBadge rank={token.swagRank} size="sm" /></td>
                          <td className="py-2 px-3 text-center">
                            <span className="bg-mibe-gold/15 text-mibe-gold py-0.5 px-2 rounded text-xs font-bold">{token.saleCount}</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-[#8b949e] text-xs">{token.transferCount}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-white">{token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}</td>
                          <td className="py-2 px-3 text-right text-mibe-text-2">{token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}</td>
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
          className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center cursor-pointer"
        >
          <img
            src={lightboxUrl}
            alt="Enlarged"
            className="max-w-[90vw] max-h-[90vh] rounded-lg"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}
    </div>
  )
}
