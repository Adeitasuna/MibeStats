'use client'

import { useEffect, useState } from 'react'
import { PieChartGrid } from '@/components/charts/PieChartGrid'
import type { TraitDistribution, TraitCount } from '@/types'

interface ChartGroup {
  groupTitle: string
  charts: Array<{ key: keyof TraitDistribution; title: string }>
}

const CHART_GROUPS: ChartGroup[] = [
  {
    groupTitle: 'Core Traits',
    charts: [
      { key: 'swagRanks',  title: 'Swag Rank' },
      { key: 'elements',   title: 'Element' },
      { key: 'archetypes', title: 'Archetype' },
      { key: 'ancestors',  title: 'Ancestor' },
    ],
  },
  {
    groupTitle: 'Astrology',
    charts: [
      { key: 'sunSigns',       title: 'Sun Sign' },
      { key: 'moonSigns',      title: 'Moon Sign' },
      { key: 'ascendingSigns', title: 'Ascending Sign' },
    ],
  },
  {
    groupTitle: 'Appearance',
    charts: [
      { key: 'bodies',         title: 'Body' },
      { key: 'eyes',           title: 'Eyes' },
      { key: 'eyebrows',       title: 'Eyebrows' },
      { key: 'mouths',         title: 'Mouth' },
      { key: 'hairs',          title: 'Hair' },
      { key: 'hats',           title: 'Hat' },
      { key: 'glasses',        title: 'Glasses' },
      { key: 'masks',          title: 'Mask' },
      { key: 'earrings',       title: 'Earrings' },
      { key: 'faceAccessories', title: 'Face Accessory' },
      { key: 'tattoos',        title: 'Tattoo' },
      { key: 'shirts',         title: 'Shirt' },
      { key: 'backgrounds',    title: 'Background' },
    ],
  },
  {
    groupTitle: 'Items & Special',
    charts: [
      { key: 'drugs',           title: 'Drug' },
      { key: 'items',           title: 'Item' },
      { key: 'grailCategories', title: 'Grail Category' },
    ],
  },
]

function BarChart({ data, colorMap }: { data: TraitCount[]; colorMap?: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((item) => {
        const barColor = colorMap?.[item.value] ?? '#ffd700'
        const widthPct = Math.max(item.pct, 2) // min 2% so the bar is always visible
        return (
          <div key={item.value} className="flex items-center gap-2">
            <span className="text-xs text-white w-20 shrink-0 truncate">{item.value}</span>
            <div className="flex-1 h-5 bg-mibe-hover rounded overflow-hidden">
              <div
                className="h-full rounded flex items-center px-1.5"
                style={{ width: `${widthPct}%`, backgroundColor: barColor, opacity: 0.75 }}
              >
                {item.pct >= 8 && (
                  <span className="text-[9px] font-bold text-black whitespace-nowrap">
                    {item.count.toLocaleString()} ({item.pct}%)
                  </span>
                )}
              </div>
            </div>
            {item.pct < 8 && (
              <span className="text-[9px] text-mibe-text-2 tabular-nums shrink-0">
                {item.count.toLocaleString()} ({item.pct}%)
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function DistributionContent() {
  const [traits, setTraits] = useState<TraitDistribution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/traits')
      .then((res) => res.json())
      .then((data) => { setTraits(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, g) => (
          <div key={g}>
            <div className="h-5 bg-white/5 rounded w-32 mb-3 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: g === 2 ? 8 : 4 }).map((_, i) => (
                <div key={i} className="card p-4 h-[260px] animate-pulse">
                  <div className="h-3 bg-white/5 rounded w-24 mb-3" />
                  <div className="h-[200px] bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!traits) {
    return (
      <div className="card p-8 text-center text-mibe-text-2">
        Failed to load trait distribution data.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Grouped trait pie charts */}
      {CHART_GROUPS.map((group) => {
        const sections = group.charts
          .map((s) => {
            const data = traits[s.key]
            return {
              title: s.title,
              data: Array.isArray(data) ? (data as TraitCount[]) : [],
            }
          })
          .filter((s) => s.data.length > 0)

        if (sections.length === 0) return null

        return (
          <section key={group.groupTitle}>
            <h2 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider mb-3">
              {group.groupTitle}
            </h2>
            <PieChartGrid sections={sections} />
          </section>
        )
      })}

      {/* Chronos Area — Time Period breakdown */}
      <section>
        <h2 className="section-title text-xl mb-2">Chronos Area</h2>
        <p className="text-mibe-text-2 text-xs mb-4">
          Distribution by historical time period and element
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="text-[10px] font-semibold text-mibe-gold mb-3 uppercase tracking-wider">
              Time Period Split
            </h3>
            <BarChart data={traits.timePeriods || []} />
          </div>

          <div className="card p-4">
            <h3 className="text-[10px] font-semibold text-mibe-gold mb-3 uppercase tracking-wider">
              Element Distribution
            </h3>
            <BarChart
              data={traits.elements || []}
              colorMap={{ Earth: '#3fb950', Fire: '#f85149', Water: '#58a6ff', Air: '#bc8cff' }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
