import nextDynamic from 'next/dynamic'
import { StatCard } from '@/components/ui/StatCard'
import { RecentSalesFeed } from '@/components/collection/RecentSalesFeed'
import { TopSales } from '@/components/collection/TopSales'
import type { CollectionResponse, FloorSnapshot } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MibeEden',
}

const FloorPriceChart = nextDynamic(
  () => import('@/components/charts/FloorPriceChart').then((m) => m.FloorPriceChart),
  { ssr: false, loading: () => <div className="card p-4 h-[240px] bg-white/5 animate-pulse rounded" /> },
)

const EdenDataSection = nextDynamic(
  () => import('@/components/eden/EdenDataSection').then((m) => m.EdenDataSection),
  { ssr: false, loading: () => <div className="card p-6 h-[200px] bg-white/5 animate-pulse rounded" /> },
)

export const dynamic = 'force-dynamic'

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

export default async function EdenPage() {
  const [data, history] = await Promise.all([getCollectionData(), getFloorHistory()])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="section-title text-3xl">MibeEden</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          MagicEden marketplace analytics for Mibera333
        </p>
      </div>

      {/* Floor + All-time Volume (gold bordered) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-gold p-4 flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-widest text-mibe-gold">Floor Price</span>
          <span className="text-2xl font-bold text-white">{fmt(data?.floorPrice) ?? '—'}</span>
        </div>
        <div className="card-gold p-4 flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-widest text-mibe-gold">All-Time Volume</span>
          <span className="text-2xl font-bold text-white">{fmt(data?.volumeAllTime) ?? '—'}</span>
        </div>
      </div>

      {/* Volume stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="24h Volume" value={fmt(data?.volume24h)} />
        <StatCard label="7d Volume" value={fmt(data?.volume7d)} />
        <StatCard label="30d Volume" value={fmt(data?.volume30d)} />
        <StatCard
          label="Total Sales"
          value={fmtCount(data?.totalSales)}
          subvalue={data?.totalHolders ? `${fmtCount(data.totalHolders)} holders` : undefined}
        />
      </div>

      {/* Floor price chart */}
      <FloorPriceChart data={history} />

      {/* Eden extra data: pie charts, best sales table, most sold */}
      <EdenDataSection />

      {/* Recent + Top Sales feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentSalesFeed sales={data?.recentSales ?? []} />
        <TopSales sales={data?.topSales ?? []} />
      </div>
    </div>
  )
}
