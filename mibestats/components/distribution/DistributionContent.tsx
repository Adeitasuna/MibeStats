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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
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
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>{group.groupTitle}</h2>
            <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '1rem' }} />
            <PieChartGrid sections={sections} />
          </section>
        )
      })}

      {/* Chronos Area — Time Period breakdown */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Chronos Area</h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="text-xs font-semibold text-mibe-gold uppercase tracking-wider">
              Time Period Split
            </span>
            <div className="card p-4">
              <BarChart data={traits.timePeriods || []} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="text-xs font-semibold text-mibe-gold uppercase tracking-wider">
              Element Distribution
            </span>
            <div className="card p-4">
              <BarChart
                data={traits.elements || []}
                colorMap={{ Earth: '#3fb950', Fire: '#f85149', Water: '#58a6ff', Air: '#bc8cff' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
