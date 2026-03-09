'use client'

import { TOOLTIP_STYLE } from '@/lib/chart-constants'

interface ChartTooltipProps {
  name: string
  count: number
  total: number
}

export function ChartTooltip({ name, count, total }: ChartTooltipProps) {
  const pct = ((count / total) * 100).toFixed(1)
  return (
    <div style={TOOLTIP_STYLE}>
      <span className="text-mibe-gold font-bold">{name}</span>
      <span className="text-white"> : {pct}% ({count.toLocaleString()})</span>
    </div>
  )
}
