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
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-mibe-gold mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={35}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#21262d',
              border: '1px solid #30363d',
              borderRadius: 8,
              fontSize: 12,
              color: '#e6edf3',
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Count']}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#8b949e' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
