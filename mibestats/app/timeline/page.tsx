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
      <div className="card p-8 h-[540px] animate-pulse flex items-center justify-center">
        <span className="text-mibe-text-2">Loading timeline...</span>
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
