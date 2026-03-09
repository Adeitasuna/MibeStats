'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  Treemap as RechartTreemap,
} from 'recharts'
import type { TraitDistribution, TraitCount } from '@/types'

const CATEGORIES: Array<{ key: keyof TraitDistribution; label: string }> = [
  { key: 'archetypes',  label: 'Archetype'  },
  { key: 'ancestors',   label: 'Ancestor'   },
  { key: 'elements',    label: 'Element'    },
  { key: 'drugs',       label: 'Drug'       },
  { key: 'backgrounds', label: 'Background' },
  { key: 'swagRanks',   label: 'Swag Rank'  },
]

const PIE_MAX_ITEMS = 10
const BAR_MAX_ITEMS = 20

const BAR_COLOR   = '#3B82F6'
const BAR_ACTIVE  = '#EAB308'

const PIE_COLORS = [
  '#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149',
  '#bc8cff', '#f0883e', '#8b949e', '#db61a2', '#79c0ff',
]

const TOOLTIP_BOX: React.CSSProperties = {
  background: '#000',
  border: '1px solid #ffd700',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
}

function ChartTooltip({ name, count, total }: { name: string; count: number; total: number }) {
  const pct = ((count / total) * 100).toFixed(1)
  return (
    <div style={TOOLTIP_BOX}>
      <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{name}</span>
      <span style={{ color: '#fff' }}> : {pct}% ({count.toLocaleString()})</span>
    </div>
  )
}

function getTreemapColor(count: number, maxCount: number): string {
  const ratio = Math.min(count / maxCount, 1)
  const r = Math.round(26 + ratio * (255 - 26))
  const g = Math.round(26 + ratio * (215 - 26))
  const b = Math.round(46 + ratio * (0 - 46))
  return `rgb(${r}, ${g}, ${b})`
}

interface TreemapContentProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  size: number
  maxCount: number
}

function TraitTreemapContent(props: TreemapContentProps) {
  const { x, y, width, height, size, maxCount } = props
  if (width < 4 || height < 4) return null

  const color = getTreemapColor(size, maxCount)
  const showCount = width > 24 && height > 16

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={color} stroke="#0d1117" strokeWidth={1} rx={2}
      />
      {showCount && (
        <text
          x={x + width / 2} y={y + height / 2}
          textAnchor="middle" dominantBaseline="central"
          fill={size / maxCount > 0.3 ? '#000' : '#e6edf3'}
          fontSize={Math.min(11, width / 5)} fontWeight="bold"
        >
          {size.toLocaleString()}
        </text>
      )}
    </g>
  )
}

interface Props {
  traits:         TraitDistribution
  activeCategory: string
  currentFilters: Record<string, string>
}

export function TraitDistributionChart({ traits, activeCategory, currentFilters }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [sortAsc, setSortAsc] = useState(false)

  const setCategory = (key: string) => {
    const params = new URLSearchParams(currentFilters)
    params.set('chart_cat', key)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const raw = traits[activeCategory as keyof TraitDistribution]
  const items: TraitCount[] = Array.isArray(raw) ? (raw as TraitCount[]) : []

  const sorted = [...items].sort((a, b) => sortAsc ? a.count - b.count : b.count - a.count)
  const total = items.reduce((s, d) => s + d.count, 0)
  const isBarMode = items.length > PIE_MAX_ITEMS && items.length <= BAR_MAX_ITEMS

  return (
    <div>
      {/* Category tabs + sort toggle (sort only in bar mode) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={String(key)}
            onClick={() => setCategory(String(key))}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeCategory === String(key)
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
        {isBarMode && (
          <>
            <span className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={() => setSortAsc(false)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                !sortAsc ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Sort descending"
            >↓</button>
            <button
              onClick={() => setSortAsc(true)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                sortAsc ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Sort ascending"
            >↑</button>
          </>
        )}
      </div>

      {items.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
          No data
        </div>
      ) : items.length > BAR_MAX_ITEMS ? (
        /* > 20 items → treemap (all data) */
        (() => {
          const maxCount = sorted[0]?.count ?? 1
          const treemapChildren = sorted.map((d) => ({ name: d.value, size: d.count }))
          const treemapData = [{ name: 'root', children: treemapChildren }]
          return (
            <ResponsiveContainer width="100%" height={300}>
              <RechartTreemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                aspectRatio={4 / 3}
                stroke="#0d1117"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={<TraitTreemapContent maxCount={maxCount} x={0} y={0} width={0} height={0} name="" size={0} /> as any}
              >
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload
                    return <ChartTooltip name={d.name} count={d.size} total={total} />
                  }}
                />
              </RechartTreemap>
            </ResponsiveContainer>
          )
        })()
      ) : items.length > PIE_MAX_ITEMS ? (
        /* 11–20 items → bar chart */
        (() => {
          const directed = sortAsc ? [...sorted].reverse() : sorted
          const chartData = directed.map((item) => ({
            name:     item.value.length > 18 ? item.value.slice(0, 16) + '…' : item.value,
            fullName: item.value,
            count:    item.count,
            pct:      item.pct,
          }))
          return (
            <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 20)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 36, top: 4, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fill: '#d1d5db', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload
                    return <ChartTooltip name={d.fullName} count={d.count} total={total} />
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={12}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={!sortAsc && i === 0 ? BAR_ACTIVE : BAR_COLOR}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        })()
      ) : (
        /* ≤ 10 items → donut pie chart */
        (() => {
          const pieData = sorted.map((d) => ({
            name: `${d.value} (${d.count.toLocaleString()})`,
            rawName: d.value,
            value: d.count,
          }))
          return (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={25}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={1}
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload
                    return <ChartTooltip name={d.rawName} count={d.value} total={total} />
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )
        })()
      )}
    </div>
  )
}
