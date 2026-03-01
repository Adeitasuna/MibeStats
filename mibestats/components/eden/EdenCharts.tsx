'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const GOLD = '#ffd700'
const CYAN = '#58a6ff'
const COLORS = [GOLD, CYAN, '#ff69b4', '#3fb950', '#f85149', '#bc8cff', '#f0883e', '#8b949e']

interface PieData {
  name: string
  value: number
}

interface EdenPieChartProps {
  data: PieData[]
  title: string
}

export function EdenPieChart({ data, title }: EdenPieChartProps) {
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
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-mibe-gold mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={35}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#000',
              border: '1px solid #ffd700',
              borderRadius: 8,
              fontSize: 12,
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#fff' }}
            formatter={(value: number, name: string) => {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
              return [`${pct}% (${value.toLocaleString()})`, name]
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#8b949e' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
