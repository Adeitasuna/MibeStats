'use client'

import { useEffect, useState } from 'react'
import { PacManLoader } from '@/components/ui/PacManLoader'
import {
  Cell, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis,
} from 'recharts'
import { PieChartGrid } from '@/components/charts/PieChartGrid'
import { TimelineTreemap } from '@/components/charts/Treemap'
import type { TraitDistribution, TraitCount } from '@/types'

interface YearData {
  year: number
  era: string
  count: number
  label: string
}

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

/* ── Chronos Area constants ── */

const ERA_ORDER = [
  'Prehistory', 'Paleolithic', 'Neolithic', 'Early Antiquity', 'Late Antiquity',
  'Early Middle Ages', 'Middle Ages', 'Modern Times', 'Contemporary Era', '20th Century and beyond',
]

const TOOLTIP_BOX: React.CSSProperties = {
  background: '#000',
  border: '1px solid #ffd700',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 11,
}

function eraBarColor(index: number, total: number): string {
  const t = total <= 1 ? 0 : index / (total - 1)
  const r = Math.round(26 + t * (255 - 26))
  const g = Math.round(58 + t * (215 - 58))
  const b = Math.round(92 + t * (0 - 92))
  return `rgb(${r}, ${g}, ${b})`
}

function ChronosArea({ data }: { data: TraitCount[] }) {
  if (data.length === 0) return null

  const total = data.reduce((s, d) => s + d.count, 0)

  // Bar: chronological order
  const chronoSorted = ERA_ORDER
    .map((era) => data.find((d) => d.value === era))
    .filter((d): d is TraitCount => d != null)
  const barData = chronoSorted.map((d) => ({ name: d.value, value: d.count }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem' }}>
      <span className="card-title-upper">Timeline Distribution</span>
      <div className="card p-3 flex flex-col">
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={barData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 10, fill: '#8b949e' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = payload[0].payload
                const pct = ((d.value / total) * 100).toFixed(1)
                return (
                  <div style={TOOLTIP_BOX}>
                    <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{d.name}</span>
                    <span style={{ color: '#fff' }}> : {pct}% ({d.value.toLocaleString()})</span>
                  </div>
                )
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {barData.map((_, i) => (
                <Cell key={i} fill={eraBarColor(i, barData.length)} opacity={0.85} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DistributionContent() {
  const [traits, setTraits] = useState<TraitDistribution | null>(null)
  const [timelineData, setTimelineData] = useState<YearData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch('/api/traits', { signal: controller.signal }).then((res) => res.json()),
      fetch('/api/tokens/timeline', { signal: controller.signal }).then((res) => res.json()),
    ])
      .then(([traitsData, tlData]) => {
        setTraits(traitsData)
        setTimelineData(tlData.data ?? [])
      })
      .catch((err) => {
        if (err.name !== 'AbortError') { /* swallow */ }
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <PacManLoader />
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
            <h2 className="separator">{group.groupTitle}</h2>
            <PieChartGrid sections={sections} />
          </section>
        )
      })}

      {/* Chronos Area — Era Distribution */}
      <section>
        <h2 className="separator">Chronos Area</h2>
        <div className="flex flex-col gap-6">
          {/* Birthday Year treemap — full width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="card-title-upper">Birthday Year</span>
            <TimelineTreemap data={timelineData.map((d) => ({
              name: d.label,
              size: d.count,
              year: d.year,
              era: d.era,
            }))} />
          </div>
          {/* Era Distribution + Timeline Distribution side by side */}
          <ChronosArea data={traits.chronoAreas || []} />
        </div>
      </section>
    </div>
  )
}
