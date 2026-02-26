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
    ...top.map((d) => ({ name: d.value, value: d.count })),
    ...(restCount > 0 ? [{ name: 'Other', value: restCount }] : []),
  ]

  return (
    <div className="card p-3">
      <h3 className="text-xs font-semibold text-mibe-gold mb-1 uppercase tracking-wider truncate">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={65}
            innerRadius={28}
            dataKey="value"
            nameKey="name"
            paddingAngle={1}
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.8} />
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
              const pct = ((value / 10000) * 100).toFixed(1)
              return [`${value.toLocaleString()} (${pct}%)`, name]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Compact legend below */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 px-1">
        {chartData.slice(0, 6).map((d, i) => (
          <span key={d.name} className="flex items-center gap-1 text-[9px] text-mibe-text-2">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="truncate max-w-[60px]">{d.name}</span>
          </span>
        ))}
        {chartData.length > 6 && (
          <span className="text-[9px] text-mibe-muted">+{chartData.length - 6} more</span>
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
