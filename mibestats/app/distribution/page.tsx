import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'
import type { TraitDistribution } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'MibeDistribution',
}

const DistributionContent = nextDynamic(
  () => import('@/components/distribution/DistributionContent').then((m) => m.DistributionContent),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="card p-4 h-[260px] animate-pulse">
            <div className="h-3 bg-white/5 rounded w-24 mb-3" />
            <div className="h-[200px] bg-white/5 rounded" />
          </div>
        ))}
      </div>
    ),
  },
)

export default function DistributionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeDistribution</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          Trait distribution across all 10,000 Miberas — ~24 categories
        </p>
      </div>

      <DistributionContent />
    </div>
  )
}
