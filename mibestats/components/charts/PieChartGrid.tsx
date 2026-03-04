'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'
import type { TraitCount } from '@/types'

const COLORS = [
  '#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149',
  '#bc8cff', '#f0883e', '#8b949e', '#db61a2', '#79c0ff',
  '#56d364', '#ffa657', '#ff7b72', '#d2a8ff', '#a5d6ff',
  '#7ee787', '#ffc680', '#ffa198', '#e2c5ff', '#c8e1ff',
]

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#000',
    border: '1px solid #ffd700',
    borderRadius: 8,
    fontSize: 11,
    color: '#fff',
  },
  itemStyle: { color: '#fff' },
  labelStyle: { color: '#fff' },
} as const

/** Switch to bar chart when more than 15 unique values */
const PIE_MAX_ITEMS = 15
const BAR_MAX_ITEMS = 20

interface PieChartCardProps {
  title: string
  data: TraitCount[]
  maxSlices?: number
}

function PieChartCard({ title, data, maxSlices = 12 }: PieChartCardProps) {
  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const total = sorted.reduce((s, d) => s + d.count, 0)

  // More than 15 unique values → horizontal bar chart (no "Other" needed)
  if (data.length > PIE_MAX_ITEMS) {
    const barData = sorted.slice(0, BAR_MAX_ITEMS).map((d) => ({
      name: d.value,
      value: d.count,
    }))
    const barHeight = Math.max(200, barData.length * 24)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="card-title-upper">
          {title}
          <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
        </span>
        <div className="card p-3 flex flex-col">
          <ResponsiveContainer width="100%" height={barHeight}>
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 10, fill: '#8b949e' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value: number) => {
                  const pct = ((value / total) * 100).toFixed(1)
                  return [`${value.toLocaleString()} (${pct}%)`, '']
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Few items → donut pie chart
  const top = sorted.slice(0, maxSlices)
  const restCount = sorted.slice(maxSlices).reduce((sum, d) => sum + d.count, 0)
  const chartData = [
    ...top.map((d) => ({ name: `${d.value} (${d.count.toLocaleString()})`, value: d.count, pct: d.pct })),
    ...(restCount > 0 ? [{ name: 'Other', value: restCount, pct: +(restCount / 100).toFixed(1) }] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">
        {title}
        <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
      </span>
      <div className="card p-3 flex flex-col">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={60}
            innerRadius={25}
            dataKey="value"
            nameKey="name"
            paddingAngle={1}
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value: number) => {
              const pct = ((value / total) * 100).toFixed(1)
              return [`${pct}% (${value.toLocaleString()})`, '']
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}

interface PieChartGridProps {
  sections: Array<{ title: string; data: TraitCount[] }>
  columns?: number
}

export function PieChartGrid({ sections, columns }: PieChartGridProps) {
  const cols = columns ?? (sections.length <= 6 ? sections.length : 4)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.75rem' }}>
      {sections.map((section) => (
        <PieChartCard
          key={section.title}
          title={section.title}
          data={section.data}
        />
      ))}
    </div>
  )
}
