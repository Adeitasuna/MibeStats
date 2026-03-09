'use client'

import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis,
  Treemap as RechartTreemap,
} from 'recharts'
import type { TraitCount } from '@/types'
import { CHART_COLORS } from '@/lib/chart-constants'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { TreemapCellContent } from '@/components/charts/TreemapContent'

const PIE_MAX_ITEMS = 10
const BAR_MAX_ITEMS = 20

interface PieChartCardProps {
  title: string
  data: TraitCount[]
  maxSlices?: number
}

function PieChartCard({ title, data, maxSlices = 12 }: PieChartCardProps) {
  const [sortAsc, setSortAsc] = useState(false)

  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const total = sorted.reduce((s, d) => s + d.count, 0)

  // > 20 items → treemap (all data)
  if (data.length > BAR_MAX_ITEMS) {
    const maxCount = sorted[0]?.count ?? 1
    const treemapChildren = sorted.map((d) => ({ name: d.value, size: d.count }))
    const treemapData = [{ name: 'root', children: treemapChildren }]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="card-title-upper">
          {title}
          <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
        </span>
        <div className="card p-3 flex flex-col">
          <ResponsiveContainer width="100%" height={300}>
            <RechartTreemap
              data={treemapData}
              dataKey="size"
              nameKey="name"
              aspectRatio={4 / 3}
              stroke="#0d1117"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={<TreemapCellContent maxCount={maxCount} x={0} y={0} width={0} height={0} name="" size={0} /> as any}
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
        </div>
      </div>
    )
  }

  // 11–20 items → horizontal bar chart
  if (data.length > PIE_MAX_ITEMS) {
    const directed = sortAsc ? [...sorted].reverse() : sorted
    const barData = directed.map((d) => ({ name: d.value, value: d.count }))
    const barHeight = Math.max(200, barData.length * 20)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div className="flex items-center gap-1.5">
          <span className="card-title-upper">
            {title}
            <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
          </span>
          <span className="w-px h-3 bg-white/10 mx-0.5" />
          <button
            onClick={() => setSortAsc(false)}
            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
              !sortAsc ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Sort descending"
          >↓</button>
          <button
            onClick={() => setSortAsc(true)}
            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
              sortAsc ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Sort ascending"
          >↑</button>
        </div>
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
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return <ChartTooltip name={d.name} count={d.value} total={total} />
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={12}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
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
    ...top.map((d) => ({ name: `${d.value} (${d.count.toLocaleString()})`, rawName: d.value, value: d.count })),
    ...(restCount > 0 ? [{ name: 'Other', rawName: 'Other', value: restCount }] : []),
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
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
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
