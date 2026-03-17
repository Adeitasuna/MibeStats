'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PIE_COLORS } from './bubblemap-constants'

interface PieChartEntry {
  name: string
  value: number
  color?: string
}

interface BubblePieChartsProps {
  tierData: PieChartEntry[]
  nftByTierData: PieChartEntry[]
  nftDistData: PieChartEntry[]
  walletCount: number
  totalNfts: number
}

const tooltipStyle = {
  background: '#000',
  border: '1px solid #ffd700',
  borderRadius: 8,
  fontSize: 11,
  color: '#fff',
}
const itemStyle = { color: '#fff' }
const legendStyle = { fontSize: 10, color: '#8b949e' }
const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.25rem',
  padding: '0.5rem',
  flex: 1,
}

export function BubblePieCharts({ tierData, nftByTierData, nftDistData, walletCount, totalNfts }: BubblePieChartsProps) {
  return (
    <>
      {/* Tier Distribution (col 4) */}
      <div style={{ gridColumn: '4 / 5', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="card-title-upper">
          Tier Distribution
        </span>
        <div style={cardStyle}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={tierData} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
                {tierData.map((d, i) => (
                  <Cell key={i} fill={d.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={itemStyle}
                formatter={(value: number, name: string) => {
                  const pct = walletCount > 0 ? ((value / walletCount) * 100).toFixed(1) : '0.0'
                  return [`${pct}%`, name]
                }}
              />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NFTs by Tier (cols 5-6) */}
      <div style={{ gridColumn: '5 / 7', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="card-title-upper">
          NFTs by Tier ({totalNfts.toLocaleString()} NFTs)
        </span>
        <div style={cardStyle}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={nftByTierData} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" nameKey="name" paddingAngle={2} stroke="none">
                {nftByTierData.map((d, i) => (
                  <Cell key={i} fill={d.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={itemStyle}
                formatter={(value: number, name: string) => {
                  const pct = totalNfts > 0 ? ((value / totalNfts) * 100).toFixed(1) : '0.0'
                  return [`${pct}%`, name]
                }}
              />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NFT Distribution (cols 4-6) */}
      <div style={{ gridColumn: '4 / 7', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span className="card-title-upper">
          NFT Distribution ({totalNfts.toLocaleString()} NFTs)
        </span>
        <div style={cardStyle}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={nftDistData} cx="50%" cy="50%" outerRadius={55} innerRadius={25} dataKey="value" nameKey="name" paddingAngle={1} stroke="none">
                {nftDistData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={itemStyle}
                formatter={(value: number, name: string) => {
                  const pct = totalNfts > 0 ? ((value / totalNfts) * 100).toFixed(1) : '0.0'
                  return [`${pct}%`, name]
                }}
              />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
