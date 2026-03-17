'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { FloorSnapshot, Range } from './EdenTypes'

export function FloorChart({ data: _data }: { data: FloorSnapshot[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">Floor Price</span>
      <div className="stat-card" style={{ padding: '0.75rem' }}>
        <div style={{ height: '12rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#ffd700', fontSize: '1.25rem' }}>Coming soon</span>
          <span style={{ color: '#555', fontSize: '0.75rem', textAlign: 'center' }}>
            Floor price chart will resume once OpenSea API is connected
          </span>
        </div>
      </div>
    </div>
  )
}
