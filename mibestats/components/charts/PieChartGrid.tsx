'use client'

import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis,
  Treemap as RechartTreemap,
} from 'recharts'
import type { TraitCount } from '@/types'

const COLORS = [
  '#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149',
  '#bc8cff', '#f0883e', '#8b949e', '#db61a2', '#79c0ff',
  '#56d364', '#ffa657', '#ff7b72', '#d2a8ff', '#a5d6ff',
  '#7ee787', '#ffc680', '#ffa198', '#e2c5ff', '#c8e1ff',
]

const TOOLTIP_BOX: React.CSSProperties = {
  background: '#000',
  border: '1px solid #ffd700',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 11,
}

function ChartTooltip({ name, count, total }: { name: string; count: number; total: number }) {
  const pct = ((count / total) * 100).toFixed(1)
  return (
    <div style={TOOLTIP_BOX}>
      <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{name}</span>
      <span style={{ color: '#fff' }}> : {pct}% ({count.toLocaleString()})</span>
    </div>
  )
}

const PIE_MAX_ITEMS = 10
const BAR_MAX_ITEMS = 20

function getTreemapColor(count: number, maxCount: number): string {
  const ratio = Math.min(count / maxCount, 1)
  const r = Math.round(26 + ratio * (255 - 26))
  const g = Math.round(26 + ratio * (215 - 26))
  const b = Math.round(46 + ratio * (0 - 46))
  return `rgb(${r}, ${g}, ${b})`
}

interface TreemapContentProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  size: number
  maxCount: number
}

function DistributionTreemapContent(props: TreemapContentProps) {
  const { x, y, width, height, name, size, maxCount } = props
  if (width < 4 || height < 4) return null

  const color = getTreemapColor(size, maxCount)
  const textColor = size / maxCount > 0.3 ? '#000' : '#e6edf3'
  const fontSize = Math.min(11, width / 5)
  const charWidth = fontSize * 0.6
  const maxChars = Math.floor((width - 8) / charWidth)
  const showName = width > 30 && height > 28 && maxChars > 2
  const showCount = width > 24 && height > 16

  const displayName = name && maxChars > 0
    ? name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name
    : ''

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={color} stroke="#0d1117" strokeWidth={1} rx={2}
      />
      {showName && (
        <text
          x={x + width / 2} y={y + height / 2 - (showCount ? fontSize * 0.6 : 0)}
          textAnchor="middle" dominantBaseline="central"
          fill={textColor}
          fontSize={fontSize} fontWeight="bold"
        >
          {displayName}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2} y={y + height / 2 + (showName ? fontSize * 0.6 : 0)}
          textAnchor="middle" dominantBaseline="central"
          fill={textColor}
          fontSize={fontSize * 0.85} fontWeight="normal"
          opacity={0.8}
        >
          {size.toLocaleString()}
        </text>
      )}
    </g>
  )
}

interface PieChartCardProps {
  title: string
  data: TraitCount[]
  maxSlices?: number
}

function PieChartCard({ title, data, maxSlices = 12 }: PieChartCardProps) {
  const [sortAsc, setSortAsc] = useState(false)

  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const total = sorted.reduce((s, d) => s + d.count, 0)

  // > 20 items → treemap (all data)
  if (data.length > BAR_MAX_ITEMS) {
    const maxCount = sorted[0]?.count ?? 1
    const treemapChildren = sorted.map((d) => ({ name: d.value, size: d.count }))
    const treemapData = [{ name: 'root', children: treemapChildren }]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="card-title-upper">
          {title}
          <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
        </span>
        <div className="card p-3 flex flex-col">
          <ResponsiveContainer width="100%" height={300}>
            <RechartTreemap
              data={treemapData}
              dataKey="size"
              nameKey="name"
              aspectRatio={4 / 3}
              stroke="#0d1117"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={<DistributionTreemapContent maxCount={maxCount} x={0} y={0} width={0} height={0} name="" size={0} /> as any}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return <ChartTooltip name={d.name} count={d.size} total={total} />
                }}
              />
            </RechartTreemap>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // 11–20 items → horizontal bar chart
  if (data.length > PIE_MAX_ITEMS) {
    const directed = sortAsc ? [...sorted].reverse() : sorted
    const barData = directed.map((d) => ({ name: d.value, value: d.count }))
    const barHeight = Math.max(200, barData.length * 20)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div className="flex items-center gap-1.5">
          <span className="card-title-upper">
            {title}
            <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
          </span>
          <span className="w-px h-3 bg-white/10 mx-0.5" />
          <button
            onClick={() => setSortAsc(false)}
            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
              !sortAsc ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Sort descending"
          >↓</button>
          <button
            onClick={() => setSortAsc(true)}
            className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
              sortAsc ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Sort ascending"
          >↑</button>
        </div>
        <div className="card p-3 flex flex-col">
          <ResponsiveContainer width="100%" height={barHeight}>
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 10, fill: '#8b949e' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return <ChartTooltip name={d.name} count={d.value} total={total} />
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={12}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Few items → donut pie chart
  const top = sorted.slice(0, maxSlices)
  const restCount = sorted.slice(maxSlices).reduce((sum, d) => sum + d.count, 0)
  const chartData = [
    ...top.map((d) => ({ name: `${d.value} (${d.count.toLocaleString()})`, rawName: d.value, value: d.count })),
    ...(restCount > 0 ? [{ name: 'Other', rawName: 'Other', value: restCount }] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">
        {title}
        <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: '0.375rem' }}>({data.length})</span>
      </span>
      <div className="card p-3 flex flex-col">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={60}
            innerRadius={25}
            dataKey="value"
            nameKey="name"
            paddingAngle={1}
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload
              return <ChartTooltip name={d.rawName} count={d.value} total={total} />
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}

interface PieChartGridProps {
  sections: Array<{ title: string; data: TraitCount[] }>
  columns?: number
}

export function PieChartGrid({ sections, columns }: PieChartGridProps) {
  const cols = columns ?? (sections.length <= 6 ? sections.length : 4)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.75rem' }}>
      {sections.map((section) => (
        <PieChartCard
          key={section.title}
          title={section.title}
          data={section.data}
        />
      ))}
    </div>
  )
}
