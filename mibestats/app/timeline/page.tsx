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
      <div className="card h-[300px] md:h-[420px] lg:h-[520px] animate-pulse flex items-center justify-center">
        <span className="text-mibe-text-2 text-sm">Loading timeline...</span>
      </div>
    ),
  },
)

export default function TimelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title">MibeTimeline</h1>
        <p className="chapo-h1">
          Birthday year treemap — bigger blocks = more Miberas born that year.
          <br />
          10,000 miberas across 2254 years
        </p>
      </div>

      <TimelineContent />
    </div>
  )
}
