'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface PieChartDatum {
  name: string
  value: number
  color?: string
}

interface PieChartCardProps {
  title: string
  data: PieChartDatum[]
  /** Colors array used when data items don't carry their own `color` field */
  colors?: string[]
  /** Total used for percentage calculation in tooltip */
  total: number
  height?: number
  outerRadius?: number
  innerRadius?: number
  paddingAngle?: number
  className?: string
}

export function PieChartCard({
  title,
  data,
  colors,
  total,
  height = 200,
  outerRadius = 55,
  innerRadius = 25,
  paddingAngle = 2,
  className,
}: PieChartCardProps) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="card-title-upper">{title}</span>
      <div className="bg-[var(--bg-card)] border border-white/10 rounded p-2 flex-1">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              dataKey="value"
              nameKey="name"
              paddingAngle={paddingAngle}
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color ?? (colors ? colors[i % colors.length] : '#8b949e')}
                  opacity={0.85}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 11, color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
                return [`${pct}%`, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#8b949e' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
