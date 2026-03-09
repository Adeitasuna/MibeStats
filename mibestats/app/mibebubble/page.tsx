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
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <img src="/waiting.gif" alt="Loading..." className="max-w-[300px]" style={{ imageRendering: 'pixelated' }} />
      </div>
    ),
  },
)

export default function BubbleMapPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title text-3xl">MibeBubble</h1>
        <p className="chapo-h1">
          Wallet relationship graph showing trade connections between Mibera333 holders — discover who trades with whom
        </p>
      </div>

      <BubbleMapContent />
    </div>
  )
}
