'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import { EdenPieChart } from './EdenCharts'

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

interface EdenData {
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

export function EdenDataSection() {
  const [data, setData] = useState<EdenData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/eden')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-48 mb-4" />
            <div className="h-40 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  // Prepare pie data for grails
  const grailPieData = [
    { name: `Grails (${data.grailStats.grails})`, value: data.grailStats.grails },
    { name: `Standard (${data.grailStats.nonGrails})`, value: data.grailStats.nonGrails },
  ]

  // Prepare pie data for sales distribution (group high counts)
  const salesDistPie = data.salesDistribution
    .filter((d) => d.saleCount > 0)
    .map((d) => ({
      name: d.saleCount === 1 ? '1 sale' : `${d.saleCount} sales`,
      value: d.tokenCount,
    }))
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      {/* Sales count + volume stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="card p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-mibe-gold">Sales 1d</span>
          <span className="text-lg font-bold text-white">{data.salesStats.count1d}</span>
        </div>
        <div className="card p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-mibe-gold">Sales 7d</span>
          <span className="text-lg font-bold text-white">{data.salesStats.count7d}</span>
        </div>
        <div className="card p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-mibe-gold">Sales All</span>
          <span className="text-lg font-bold text-white">{data.salesStats.countAll.toLocaleString()}</span>
        </div>
        <div className="card p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-mibe-gold">Vol 1d</span>
          <span className="text-lg font-bold text-white">{data.salesStats.volume1d.toFixed(1)} BERA</span>
        </div>
        <div className="card p-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-mibe-gold">Vol 7d</span>
          <span className="text-lg font-bold text-white">{data.salesStats.volume7d.toFixed(1)} BERA</span>
        </div>
      </div>

      {/* Pie charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EdenPieChart data={grailPieData} title="Diamond per Mibera (Grails)" />
        <EdenPieChart data={salesDistPie} title="Nb Sales per Mibera" />
      </div>

      {/* Best Sales Top 30 */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-mibe-border">
          <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">
            Best Sales — Top 30
          </h3>
        </div>
        <div className="overflow-x-auto">
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
              {data.bestSales.map((sale, i) => (
                <tr key={sale.id} className="border-b border-mibe-border/30 hover:bg-mibe-hover/30">
                  <td className="p-3 text-mibe-muted">{i + 1}</td>
                  <td className="p-2">
                    {sale.imageUrl ? (
                      <div className="relative w-8 h-8 rounded overflow-hidden">
                        <Image
                          src={sale.imageUrl}
                          alt={`#${sale.tokenId}`}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-mibe-hover" />
                    )}
                  </td>
                  <td className="p-3">
                    <a
                      href={sale.magicEdenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-mibe-cyan hover:underline"
                    >
                      #{sale.tokenId}
                    </a>
                  </td>
                  <td className="p-3">
                    {sale.swagRank && <SwagRankBadge rank={sale.swagRank} size="sm" />}
                  </td>
                  <td className="p-3">
                    {sale.isGrail ? (
                      <span className="text-mibe-gold text-xs font-bold">
                        {sale.grailName ?? 'Yes'}
                      </span>
                    ) : (
                      <span className="text-mibe-muted">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-medium text-white tabular-nums">
                    {sale.priceBera.toFixed(2)}
                  </td>
                  <td className="p-3 text-mibe-text-2 text-xs">
                    {new Date(sale.soldAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Most Sold Miberas */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-mibe-border">
          <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">
            Most Sold Miberas
          </h3>
        </div>
        <div className="overflow-x-auto">
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
              {data.mostSold.map((token, i) => (
                <tr key={token.tokenId} className="border-b border-mibe-border/30 hover:bg-mibe-hover/30">
                  <td className="p-3 text-mibe-muted">{i + 1}</td>
                  <td className="p-2">
                    {token.imageUrl ? (
                      <div className="relative w-8 h-8 rounded overflow-hidden">
                        <Image
                          src={token.imageUrl}
                          alt={`#${token.tokenId}`}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-mibe-hover" />
                    )}
                  </td>
                  <td className="p-3">
                    <a
                      href={token.magicEdenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-mibe-cyan hover:underline"
                    >
                      #{token.tokenId}
                    </a>
                  </td>
                  <td className="p-3">
                    <SwagRankBadge rank={token.swagRank} size="sm" />
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-mibe-gold/15 text-mibe-gold px-2 py-0.5 rounded text-xs font-bold">
                      {token.saleCount}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-white tabular-nums">
                    {token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}
                  </td>
                  <td className="p-3 text-right text-mibe-text-2 tabular-nums">
                    {token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
