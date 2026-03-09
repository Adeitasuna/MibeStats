'use client'

import { getTreemapColor } from '@/lib/chart-constants'

export interface TreemapContentProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  size: number
  maxCount: number
  showLabel?: boolean
}

/**
 * Shared custom content renderer for Recharts Treemap.
 * - `showLabel` = false (default): count only (for compact treemaps)
 * - `showLabel` = true: name + count (for large treemaps)
 */
export function TreemapCellContent(props: TreemapContentProps) {
  const { x, y, width, height, name, size, maxCount, showLabel = false } = props
  if (width < 4 || height < 4) return null

  const color = getTreemapColor(size, maxCount)
  const showCount = width > 24 && height > 16
  const canShowLabel = showLabel && width > 30 && height > 20
  const canShowBoth = canShowLabel && width > 50 && height > 35
  const textFill = size / maxCount > 0.3 ? '#000' : '#e6edf3'

  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={color} stroke="#0d1117" strokeWidth={1} rx={2}
      />
      {canShowLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (canShowBoth ? 6 : 0)}
          textAnchor="middle" dominantBaseline="central"
          fill={textFill}
          fontSize={Math.min(11, width / 4)}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {canShowBoth && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle" dominantBaseline="central"
          fill={size / maxCount > 0.3 ? '#333' : '#8b949e'}
          fontSize={Math.min(9, width / 5)}
        >
          {size.toLocaleString()}
        </text>
      )}
      {!canShowLabel && showCount && (
        <text
          x={x + width / 2} y={y + height / 2}
          textAnchor="middle" dominantBaseline="central"
          fill={textFill}
          fontSize={Math.min(11, width / 5)} fontWeight="bold"
        >
          {size.toLocaleString()}
        </text>
      )}
    </g>
  )
}
