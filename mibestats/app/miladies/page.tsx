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
      <div className="grails-grid">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,236,179,0.3)', borderRadius: '0.5rem', background: '#111' }}>
            <div style={{ padding: '0.4rem 0.5rem 0.2rem', textAlign: 'center' }}>
              <div style={{ height: '0.65rem', width: '40%', margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }} />
            </div>
            <div style={{ aspectRatio: '3 / 4', borderTop: '1px solid rgba(255,236,179,0.3)', borderBottom: '1px solid rgba(255,236,179,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
              <div className="img-spinner" />
            </div>
            <div style={{ padding: '0.35rem 0.5rem 0.5rem' }}>
              <div style={{ height: '0.6rem', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '4px' }} />
              <div style={{ height: '0.6rem', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }} />
            </div>
          </div>
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
        <p className="chapo-h1">
          The Milady Maker stage — Phase 2 of the reveal timeline
        </p>
      </div>

      <MiladiesContent />
    </div>
  )
}
