'use client'

import { Treemap as RechartTreemap, ResponsiveContainer, Tooltip } from 'recharts'
import { TOOLTIP_STYLE } from '@/lib/chart-constants'
import { TreemapCellContent } from '@/components/charts/TreemapContent'

interface TreemapItem {
  name: string
  size: number
  year: number
  era: string
}

interface TreemapProps {
  data: TreemapItem[]
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
      <div style={{ height: 520 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartTreemap
            data={treemapData}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
            stroke="#0d1117"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={<TreemapCellContent maxCount={maxCount} showLabel={true} x={0} y={0} width={0} height={0} name="" size={0} /> as any}
          >
            <Tooltip
              contentStyle={{ ...TOOLTIP_STYLE, color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [
                `${value.toLocaleString()} miberas`,
                'Born this year',
              ]}
            />
          </RechartTreemap>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
