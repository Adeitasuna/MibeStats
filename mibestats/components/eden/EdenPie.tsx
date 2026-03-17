'use client'

import {
  PieChart, Pie, Cell, Legend,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { PIE_COLORS } from './EdenTypes'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">{title}</span>
      <div className="stat-card" style={{ padding: '0.75rem' }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 12, color: '#fff' }}
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
