'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

export interface SalePoint {
  soldAt:   string
  price:    number
  tokenId:  number
  isGrail:  boolean
}

interface Props {
  data: SalePoint[]
}

function fmtDate(iso: string): string {
  return iso.slice(0, 10)
}

interface TooltipPayload {
  payload: SalePoint & { date: number; price: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="text-xs p-2 rounded-lg" style={{ background: '#111', border: '1px solid #222' }}>
      <div className="text-gray-400">{new Date(d.soldAt).toLocaleDateString()}</div>
      <div className="text-white font-semibold mt-0.5">{d.price.toFixed(2)} BERA</div>
      <div className="text-gray-400">#{d.tokenId}</div>
      {d.isGrail && <div className="text-yellow-400 mt-0.5">GRAIL</div>}
    </div>
  )
}

export function PriceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
        No sales data for this period
      </div>
    )
  }

  const regular = data.filter((d) => !d.isGrail).map((d) => ({
    ...d,
    date: new Date(d.soldAt).getTime(),
  }))
  const grails = data.filter((d) => d.isGrail).map((d) => ({
    ...d,
    date: new Date(d.soldAt).getTime(),
  }))

  const minDate = Math.min(...data.map((d) => new Date(d.soldAt).getTime()))
  const maxDate = Math.max(...data.map((d) => new Date(d.soldAt).getTime()))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis
          type="number"
          dataKey="date"
          domain={[minDate, maxDate]}
          tickFormatter={(v: number) => fmtDate(new Date(v).toISOString())}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          scale="time"
        />
        <YAxis
          type="number"
          dataKey="price"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v} Ƀ`}
          width={64}
        />
        <ZAxis range={[20, 20]} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          name="Sales"
          data={regular}
          fill="#3B82F6"
          opacity={0.6}
          shape="circle"
        />
        {grails.length > 0 && (
          <Scatter
            name="Grail Sales"
            data={grails}
            fill="#EAB308"
            opacity={0.9}
            shape="diamond"
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
