'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { FloorSnapshot } from '@/types'

interface Props {
  data: FloorSnapshot[]
}

type Range = '7d' | '30d' | 'all'

export function FloorPriceChart({ data }: Props) {
  const [range, setRange] = useState<Range>('30d')

  const now     = Date.now()
  const cutoffs: Record<Range, number> = {
    '7d':  now - 7  * 24 * 60 * 60 * 1000,
    '30d': now - 30 * 24 * 60 * 60 * 1000,
    'all': 0,
  }

  const filtered = data.filter((d) => new Date(d.date).getTime() >= cutoffs[range])

  const formatted = filtered.map((d) => ({
    date:  d.date,
    price: Number(d.floorPrice.toFixed(4)),
  }))

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Floor Price
        </h2>
        <div className="flex gap-1">
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                range === r ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {formatted.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="floorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#FFD700" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(5)}   // MM-DD
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v} Ƀ`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: '#000',
                border: '1px solid #ffd700',
                borderRadius: 8,
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              formatter={(v: number) => [`${v} BERA`, 'Floor']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#FFD700"
              strokeWidth={2}
              fill="url(#floorGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
