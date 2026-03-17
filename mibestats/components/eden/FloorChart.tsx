'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { FloorSnapshot, Range } from './EdenTypes'

export function FloorChart({ data }: { data: FloorSnapshot[] }) {
  const [range, setRange] = useState<Range>('30d')

  const now = Date.now()
  const cutoffs: Record<Range, number> = {
    '7d': now - 7 * 86400000,
    '30d': now - 30 * 86400000,
    'all': 0,
  }

  // Check if data is stale (last snapshot > 2 days old)
  const lastDate = data.length > 0 ? new Date(data[data.length - 1].date).getTime() : 0
  const isStale = now - lastDate > 2 * 86400000

  const filtered = data
    .filter((d) => new Date(d.date).getTime() >= cutoffs[range])
    .map((d) => ({ date: d.date, price: Number(d.floorPrice.toFixed(4)) }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="card-title-upper">
          Floor Price
          {isStale && <span style={{ color: '#f0883e', fontSize: '0.6rem', marginLeft: '0.5rem', fontWeight: 400 }}>data paused — API down</span>}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['7d', '30d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                background: range === r ? 'rgba(255,215,0,0.15)' : 'transparent',
                color: range === r ? '#ffd700' : '#8b949e',
              }}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>
      <div className="stat-card" style={{ padding: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.875rem' }}>
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
                contentStyle={{ background: '#000', border: '1px solid #ffd700', borderRadius: 8, fontSize: 12, color: '#fff' }}
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
