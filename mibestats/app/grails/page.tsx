import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MibeGrails',
}

const GrailsContent = nextDynamic(
  () => import('@/components/grails/GrailsContent').then((m) => m.GrailsContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-white/5 rounded w-24 animate-pulse" />
          <div className="h-8 bg-white/5 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="card-gold overflow-hidden animate-pulse">
              <div className="px-2 pt-2"><div className="h-2.5 bg-white/10 rounded w-16" /></div>
              <div className="aspect-square m-1.5 bg-white/5 rounded-lg" />
              <div className="p-2"><div className="h-3 bg-white/10 rounded w-20" /><div className="h-2.5 bg-white/5 rounded w-full mt-1" /></div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
)

export default function GrailsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeGrails</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          42 hand-drawn 1/1 masterpieces
        </p>
      </div>

      <GrailsContent />
    </div>
  )
}
