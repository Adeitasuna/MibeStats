'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { SalePoint } from './PriceChart'
import type { VolumeEntry } from './VolumeChart'

const PriceChart = dynamic(
  () => import('./PriceChart').then((m) => ({ default: m.PriceChart })),
  { ssr: false, loading: () => <div className="h-[250px] bg-white/5 animate-pulse rounded" /> },
)
const VolumeChart = dynamic(
  () => import('./VolumeChart').then((m) => ({ default: m.VolumeChart })),
  { ssr: false, loading: () => <div className="h-[180px] bg-white/5 animate-pulse rounded" /> },
)

type Range = '7d' | '30d' | 'all'

interface Props {
  sales:         SalePoint[]
  volumeHistory: VolumeEntry[]
}

function filterByRange<T extends { soldAt?: string; date?: string }>(
  items: T[],
  range: Range,
  key: 'soldAt' | 'date',
): T[] {
  if (range === 'all') return items
  const days   = range === '7d' ? 7 : 30
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return items.filter((item) => {
    const raw = item[key]
    if (!raw) return false
    return new Date(raw).getTime() >= cutoff
  })
}

export function SalesCharts({ sales, volumeHistory }: Props) {
  const [range, setRange] = useState<Range>('30d')

  const filteredSales  = filterByRange(sales,         range, 'soldAt')
  const filteredVolume = filterByRange(volumeHistory, range, 'date')

  return (
    <div className="space-y-4">
      {/* Range toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Price History
        </h2>
        <div className="flex gap-1">
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                range === r ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Scatter chart */}
      <div className="card p-4">
        <p className="text-xs text-gray-500 mb-3">
          {filteredSales.length} sales · yellow diamonds = Grails
        </p>
        <PriceChart data={filteredSales} />
      </div>

      {/* Volume bar chart */}
      <div className="card p-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Daily Volume
        </h2>
        <VolumeChart data={filteredVolume} />
      </div>
    </div>
  )
}
