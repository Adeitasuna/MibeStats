'use client'

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS, TOOLTIP_STYLE } from '@/lib/chart-constants'

export function EdenPie({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  // Sort desc, limit to 12 with "Other"
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const top = sorted.slice(0, 11)
  const restValue = sorted.slice(11).reduce((s, d) => s + d.value, 0)
  const chartData = [
    ...top,
    ...(restValue > 0 ? [{ name: 'Other', value: restValue }] : []),
  ]
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col gap-1">
      <span className="card-title-upper">{title}</span>
      <div className="stat-card p-3">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ ...TOOLTIP_STYLE, color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
                return [`${pct}% (${value.toLocaleString()})`, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
