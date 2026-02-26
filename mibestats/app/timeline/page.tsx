import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'MibeTimeline',
}

const TimelineContent = nextDynamic(
  () => import('@/components/timeline/TimelineContent').then((m) => m.TimelineContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-white/5 rounded w-40 animate-pulse" />
          <div className="h-8 bg-white/5 rounded w-28 animate-pulse" />
        </div>
        <div className="card h-[300px] md:h-[420px] lg:h-[520px] animate-pulse flex items-center justify-center">
          <span className="text-mibe-text-2 text-sm">Loading timeline...</span>
        </div>
      </div>
    ),
  },
)

export default function TimelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeTimeline</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          Birthday year treemap — bigger blocks = more Miberas born that year
        </p>
      </div>

      <TimelineContent />
    </div>
  )
}
