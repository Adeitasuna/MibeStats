'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { TOOLTIP_STYLE } from '@/lib/chart-constants'
import type { FloorSnapshot } from './eden-types'

type Range = '7d' | '30d' | 'all'

export function FloorChart({ data }: { data: FloorSnapshot[] }) {
  const [range, setRange] = useState<Range>('30d')

  const now = Date.now()
  const cutoffs: Record<Range, number> = {
    '7d': now - 7 * 86400000,
    '30d': now - 30 * 86400000,
    'all': 0,
  }

  const filtered = data
    .filter((d) => new Date(d.date).getTime() >= cutoffs[range])
    .map((d) => ({ date: d.date, price: Number(d.floorPrice.toFixed(4)) }))

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="card-title-upper">Floor Price</span>
        <div className="flex gap-1">
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-2 py-0.5 text-xs font-medium rounded border-none cursor-pointer"
              style={{
                background: range === r ? 'rgba(255,215,0,0.15)' : 'transparent',
                color: range === r ? '#ffd700' : '#8b949e',
              }}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>
      <div className="stat-card p-3">
        {filtered.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-mibe-muted text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filtered} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="floorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd700" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8b949e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fill: '#8b949e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}`}
                width={45}
              />
              <Tooltip
                contentStyle={{ ...TOOLTIP_STYLE, color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: number) => [`${v} BERA`, 'Floor']}
              />
              <Area type="monotone" dataKey="price" stroke="#ffd700" strokeWidth={2} fill="url(#floorGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
