import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'MibeMap',
}

const MiberaMap = nextDynamic(
  () => import('@/components/map/MiberaMap').then((m) => m.MiberaMap),
  {
    ssr: false,
    loading: () => (
      <div className="card" style={{ height: 600 }}>
        <div className="w-full h-full flex items-center justify-center bg-mibe-card animate-pulse">
          <span className="text-mibe-text-2">Loading map...</span>
        </div>
      </div>
    ),
  },
)

export default function MapPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeMap</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          Interactive map of 10,000 Mibera birth locations — colored by ancestor
        </p>
      </div>

      <MiberaMap />
    </div>
  )
}
