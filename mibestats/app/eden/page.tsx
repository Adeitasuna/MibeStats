import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MibeEden',
}

export const dynamic = 'force-dynamic'

const EdenContent = nextDynamic(
  () => import('@/components/eden/EdenContent').then((m) => m.EdenContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card-gold p-4 animate-pulse"><div className="h-3 bg-white/10 rounded w-20 mb-2" /><div className="h-7 bg-white/10 rounded w-32" /></div>
          <div className="card-gold p-4 animate-pulse"><div className="h-3 bg-white/10 rounded w-20 mb-2" /><div className="h-7 bg-white/10 rounded w-32" /></div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-3 animate-pulse"><div className="h-2.5 bg-white/5 rounded w-14 mb-2" /><div className="h-5 bg-white/5 rounded w-16" /></div>
          ))}
        </div>
        <div className="card p-4 animate-pulse"><div className="h-[200px] bg-white/5 rounded" /></div>
      </div>
    ),
  },
)

export default function EdenPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeEden</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          MagicEden marketplace analytics for Mibera333
        </p>
      </div>

      <EdenContent />
    </div>
  )
}
