import dynamic from 'next/dynamic'
import { StatCard } from '@/components/ui/StatCard'
import { RecentSalesFeed } from '@/components/collection/RecentSalesFeed'
import { TopSales } from '@/components/collection/TopSales'
import type { CollectionResponse, FloorSnapshot } from '@/types'

const FloorPriceChart = dynamic(
  () => import('@/components/charts/FloorPriceChart').then((m) => m.FloorPriceChart),
  { ssr: false, loading: () => <div className="card p-4 h-[240px] bg-white/5 animate-pulse rounded" /> },
)

export const revalidate = 300   // 5-minute ISR

// Fetch collection stats from our own API route (server-side, no client hop)
async function getCollectionData(): Promise<CollectionResponse | null> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const res = await fetch(`${base}/api/collection`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json() as Promise<CollectionResponse>
  } catch {
    return null
  }
}

async function getFloorHistory(): Promise<FloorSnapshot[]> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    // Fetch full history — FloorPriceChart filters client-side for 7d / 30d / all
    const res = await fetch(`${base}/api/stats/floor-history?range=all`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json() as Promise<FloorSnapshot[]>
  } catch {
    return []
  }
}

function fmt(value: number | null | undefined, decimals = 2): string | null {
  if (value == null) return null
  return `${value.toFixed(decimals)} BERA`
}

function fmtCount(value: number | null | undefined): string | null {
  if (value == null) return null
  return value.toLocaleString()
}

export default async function HomePage() {
  const [data, history] = await Promise.all([getCollectionData(), getFloorHistory()])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mibera333</h1>
        <p className="text-gray-500 text-sm mt-1">
          10,000 time-travelling NFTs on Berachain
        </p>
      </div>

      {/* Stat cards — 2-col mobile, 4-col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Floor Price"
          value={fmt(data?.floorPrice)}
          subvalue="≤ 5 min refresh"
        />
        <StatCard
          label="24h Volume"
          value={fmt(data?.volume24h)}
        />
        <StatCard
          label="7d Volume"
          value={fmt(data?.volume7d)}
        />
        <StatCard
          label="Total Sales"
          value={fmtCount(data?.totalSales)}
          subvalue={data?.totalHolders ? `${fmtCount(data.totalHolders)} holders` : undefined}
        />
      </div>

      {/* Volume breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <StatCard label="30d Volume"    value={fmt(data?.volume30d)} />
        <StatCard label="All-Time Volume" value={fmt(data?.volumeAllTime)} />
      </div>

      {/* Floor price chart */}
      <FloorPriceChart data={history} />

      {/* Sales feeds — 1-col mobile, 2-col desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentSalesFeed sales={data?.recentSales ?? []} />
        <TopSales        sales={data?.topSales    ?? []} />
      </div>
    </div>
  )
}
