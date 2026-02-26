'use client'

import { Treemap as RechartTreemap, ResponsiveContainer, Tooltip } from 'recharts'

interface TreemapItem {
  name: string
  size: number
  year: number
  era: string
}

interface TreemapProps {
  data: TreemapItem[]
}

// Color scale based on count — more miberas = more intense gold
function getColor(count: number, maxCount: number): string {
  const ratio = Math.min(count / maxCount, 1)
  // Interpolate from dark blue (#1a1a2e) to gold (#ffd700)
  const r = Math.round(26 + ratio * (255 - 26))
  const g = Math.round(26 + ratio * (215 - 26))
  const b = Math.round(46 + ratio * (0 - 46))
  return `rgb(${r}, ${g}, ${b})`
}

interface CustomContentProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  size: number
  maxCount: number
}

function CustomTreemapContent(props: CustomContentProps) {
  const { x, y, width, height, name, size, maxCount } = props
  if (width < 4 || height < 4) return null

  const color = getColor(size, maxCount)
  const showLabel = width > 30 && height > 20
  const showCount = width > 50 && height > 35

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#0d1117"
        strokeWidth={1}
        rx={2}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCount ? 6 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill={size / maxCount > 0.3 ? '#000' : '#e6edf3'}
          fontSize={Math.min(11, width / 4)}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill={size / maxCount > 0.3 ? '#333' : '#8b949e'}
          fontSize={Math.min(9, width / 5)}
        >
          {size.toLocaleString()}
        </text>
      )}
    </g>
  )
}

export function TimelineTreemap({ data }: TreemapProps) {
  if (data.length === 0) {
    return (
      <div className="card p-8 text-center text-mibe-text-2">
        No birthday data available for current filters.
      </div>
    )
  }

  let maxCount = 0
  for (const d of data) {
    if (d.size > maxCount) maxCount = d.size
  }
  const treemapData = [{ name: 'root', children: data }]

  return (
    <div className="card p-3">
      <div className="h-[300px] md:h-[420px] lg:h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartTreemap
            data={treemapData}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
            stroke="#0d1117"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={<CustomTreemapContent maxCount={maxCount} x={0} y={0} width={0} height={0} name="" size={0} /> as any}
          >
            <Tooltip
              contentStyle={{
                background: '#21262d',
                border: '1px solid #30363d',
                borderRadius: 8,
                fontSize: 12,
                color: '#e6edf3',
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} miberas`,
                'Born this year',
              ]}
            />
          </RechartTreemap>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 px-1">
        <span className="text-[10px] text-mibe-muted shrink-0">Fewer</span>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden flex">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full"
              style={{ backgroundColor: getColor((i + 1) / 20 * maxCount, maxCount) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-mibe-muted shrink-0">More miberas</span>
      </div>
    </div>
  )
}
