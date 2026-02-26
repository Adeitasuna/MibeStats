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
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-white/5 rounded w-24 animate-pulse" />
          <div className="h-8 bg-white/5 rounded w-28 animate-pulse" />
        </div>
        <div className="card h-[400px] md:h-[550px] lg:h-[650px] animate-pulse">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-mibe-text-2 text-sm">Loading map...</span>
          </div>
        </div>
        <div className="card p-3 animate-pulse">
          <div className="h-3 bg-white/5 rounded w-32 mb-2" />
          <div className="h-4 bg-white/5 rounded w-full" />
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
