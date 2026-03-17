import nextDynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bubble',
}


const BubbleMapContent = nextDynamic(
  () => import('@/components/bubblemap/BubbleMapContent').then((m) => m.BubbleMapContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 10rem)' }}>
        <div className="pacman-loader"><div className="pacman" /><div className="pacman-dots"><span /><span /><span /><span /></div></div>
      </div>
    ),
  },
)

export default function BubbleMapPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title"><span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Analytics &gt; </span>Bubble</h1>
        <p className="chapo-h1">
          Wallet relationship graph showing trade connections between Mibera333 holders — discover who trades with whom
        </p>
      </div>

      <BubbleMapContent />
    </div>
  )
}
