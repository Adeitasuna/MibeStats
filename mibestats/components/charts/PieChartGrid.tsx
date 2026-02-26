'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { TraitCount } from '@/types'

const COLORS = [
  '#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149',
  '#bc8cff', '#f0883e', '#8b949e', '#db61a2', '#79c0ff',
  '#56d364', '#ffa657', '#ff7b72', '#d2a8ff', '#a5d6ff',
  '#7ee787', '#ffc680', '#ffa198', '#e2c5ff', '#c8e1ff',
]

interface PieChartCardProps {
  title: string
  data: TraitCount[]
  maxSlices?: number
}

function PieChartCard({ title, data, maxSlices = 12 }: PieChartCardProps) {
  if (data.length === 0) return null

  // Take top N and group the rest as "Other"
  const top = data.slice(0, maxSlices)
  const restCount = data.slice(maxSlices).reduce((sum, d) => sum + d.count, 0)
  const chartData = [
    ...top.map((d) => ({ name: d.value, value: d.count, pct: d.pct })),
    ...(restCount > 0 ? [{ name: 'Other', value: restCount, pct: +(restCount / 100).toFixed(1) }] : []),
  ]
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card p-3 flex flex-col">
      <h3 className="text-[10px] font-semibold text-mibe-gold mb-1 uppercase tracking-wider truncate">
        {title}
        <span className="text-mibe-muted font-normal ml-1.5">({data.length})</span>
      </h3>
      <ResponsiveContainer width="100%" height={180}>
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
          <Tooltip
            contentStyle={{
              background: '#21262d',
              border: '1px solid #30363d',
              borderRadius: 8,
              fontSize: 11,
              color: '#e6edf3',
            }}
            formatter={(value: number, name: string) => {
              const pct = ((value / total) * 100).toFixed(1)
              return [`${value.toLocaleString()} (${pct}%)`, name]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Compact legend — show top items with percentage */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 px-0.5">
        {chartData.slice(0, 8).map((d, i) => (
          <span key={d.name} className="flex items-center gap-0.5 text-[8px] text-mibe-text-2 leading-tight">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="truncate max-w-[70px]">{d.name}</span>
          </span>
        ))}
        {chartData.length > 8 && (
          <span className="text-[8px] text-mibe-muted">+{chartData.length - 8}</span>
        )}
      </div>
    </div>
  )
}

interface PieChartGridProps {
  sections: Array<{ title: string; data: TraitCount[] }>
}

export function PieChartGrid({ sections }: PieChartGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
