'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

export interface VolumeEntry {
  date:   string  // YYYY-MM-DD
  volume: number  // total BERA
}

interface Props {
  data: VolumeEntry[]
}

export function VolumeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-gray-500 text-sm">
        No volume data for this period
      </div>
    )
  }

  const formatted = data.map((d) => ({
    date:   d.date.slice(5),          // MM-DD
    volume: Math.round(d.volume * 100) / 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v} Ƀ`}
          width={64}
        />
        <Tooltip
          contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 12, color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#fff' }}
          formatter={(v: number) => [`${v.toFixed(2)} BERA`, 'Volume']}
        />
        <Bar dataKey="volume" fill="#EAB308" opacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
