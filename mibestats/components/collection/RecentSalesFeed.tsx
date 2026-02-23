import Image from 'next/image'
import Link from 'next/link'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Sale } from '@/types'
import { magicEdenUrl } from '@/types'

function timeAgo(iso: string): string {
  const ms   = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  sales: Sale[]
}

export function RecentSalesFeed({ sales }: Props) {
  return (
    <div className="card p-4">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Recent Sales
      </h2>

      <ul className="flex flex-col gap-2">
        {sales.map((sale) => (
          <li key={sale.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
            {/* Token image */}
            <Link href={magicEdenUrl(sale.tokenId)} target="_blank" rel="noreferrer" className="shrink-0">
              {sale.token?.imageUrl ? (
                <Image
                  src={sale.token.imageUrl}
                  alt={`Mibera #${sale.tokenId}`}
                  width={40}
                  height={40}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center text-xs text-gray-500">
                  ?
                </div>
              )}
            </Link>

            {/* Token ID + rank */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={magicEdenUrl(sale.tokenId)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-white hover:text-yellow-400 transition-colors"
                >
                  #{sale.tokenId}
                </Link>
                {sale.token?.swagRank && (
                  <SwagRankBadge rank={sale.token.swagRank} size="sm" />
                )}
                {sale.token?.isGrail && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded font-medium">
                    GRAIL
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{timeAgo(sale.soldAt)}</div>
            </div>

            {/* Price */}
            <span className="text-sm font-semibold text-white shrink-0">
              {sale.priceBera.toFixed(2)} <span className="text-yellow-400">Ƀ</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
