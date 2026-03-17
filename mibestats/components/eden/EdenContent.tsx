'use client'

import { useEffect, useState } from 'react'
import { PacManLoader } from '@/components/ui/PacManLoader'
import type { CollectionData, FloorSnapshot, EdenApiData } from './EdenTypes'
import { fmt, fmtShort } from './EdenTypes'
import { GoldCard, MiniCard } from './EdenStatCards'
import { FloorChart } from './FloorChart'
import { EdenPie } from './EdenPie'
import { BestSalesTable } from './BestSalesTable'
import { MostSoldTable } from './MostSoldTable'

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
      fetch('/api/eden', { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch((e) => { if (e.name === 'AbortError') throw e; return null }).then((res) => res ?? fetch('/api/eden', { signal: controller.signal }).then((r) => r.ok ? r.json() : null).catch(() => null)),
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
      <PacManLoader />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div className="card p-3 border-mibe-red text-red-400 text-sm">{error}</div>
      )}

      {/* ME API down notice */}
      {collection && collection.floorPrice == null && (
        <div className="card p-3 text-sm" style={{ border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)', color: '#ffd700' }}>
          Floor price temporarily unavailable — Magic Eden API is down. Sales data and volumes from the database are still up to date.
        </div>
      )}

      {/* Row 1: Floor Price | Max Sell Price | Lowest of Day | Highest of Day */}
      <div id="eden-row1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        <GoldCard label="Floor Price" value={fmt(collection?.floorPrice)} />
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
          <BestSalesTable bestSales={eden.bestSales} onImageClick={setLightboxUrl} />
          <MostSoldTable mostSold={eden.mostSold} onImageClick={setLightboxUrl} />
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
