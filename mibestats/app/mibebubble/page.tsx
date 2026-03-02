import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MibeBubble',
}

export const dynamic = 'force-dynamic'

const BubbleMapContent = nextDynamic(
  () => import('@/components/bubblemap/BubbleMapContent').then((m) => m.BubbleMapContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
      </div>
    ),
  },
)

export default function BubbleMapPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeBubble</h1>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Wallet relationship graph showing trade connections between Mibera333 holders — discover who trades with whom
        </p>
      </div>

      <BubbleMapContent />
    </div>
  )
}
