import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Miladies to Mibera',
}

const MiladiesContent = nextDynamic(
  () => import('@/components/miladies/MiladiesContent').then((m) => m.MiladiesContent),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className="card aspect-square animate-pulse" />
        ))}
      </div>
    ),
  },
)

export default function MiladiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">Miladies to Mibera</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          The Milady Maker stage — Phase 2 of the reveal timeline
        </p>
      </div>

      <MiladiesContent />
    </div>
  )
}
