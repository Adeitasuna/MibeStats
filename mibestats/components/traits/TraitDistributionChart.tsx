'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { TraitDistribution, TraitCount } from '@/types'

const CATEGORIES: Array<{ key: keyof TraitDistribution; label: string }> = [
  { key: 'archetypes',  label: 'Archetype'  },
  { key: 'ancestors',   label: 'Ancestor'   },
  { key: 'elements',    label: 'Element'    },
  { key: 'drugs',       label: 'Drug'       },
  { key: 'backgrounds', label: 'Background' },
  { key: 'swagRanks',   label: 'Swag Rank'  },
]

const BAR_COLOR   = '#3B82F6'
const BAR_ACTIVE  = '#EAB308'

interface Props {
  traits:         TraitDistribution
  activeCategory: string
  currentFilters: Record<string, string>
}

interface TooltipEntry {
  payload: { pct: number; fullName: string }
}

export function TraitDistributionChart({ traits, activeCategory, currentFilters }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const setCategory = (key: string) => {
    const params = new URLSearchParams(currentFilters)
    params.set('chart_cat', key)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const raw = traits[activeCategory as keyof TraitDistribution]
  const items: TraitCount[] = Array.isArray(raw) ? (raw as TraitCount[]) : []

  const chartData = items.slice(0, 20).map((item) => ({
    name:     item.value.length > 18 ? item.value.slice(0, 16) + '…' : item.value,
    fullName: item.value,
    count:    item.count,
    pct:      item.pct,
  }))

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={String(key)}
            onClick={() => setCategory(String(key))}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeCategory === String(key)
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 24)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 36, top: 4, bottom: 4 }}
          >
            <XAxis
              type="number"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fill: '#d1d5db', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: '#000', border: '1px solid #ffd700',
                borderRadius: 8, fontSize: 12, color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: number, _: string, props: any) => [
                `${value.toLocaleString()} (${props.payload.pct}%)`,
                'Tokens',
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(_: string, props: any[]) =>
                props[0]?.payload?.fullName ?? _
              }
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? BAR_ACTIVE : BAR_COLOR}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
