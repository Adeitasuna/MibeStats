import Image from 'next/image'
import Link from 'next/link'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import { timeAgo } from '@/lib/format'
import type { Sale } from '@/types'
import { magicEdenUrl } from '@/types'

interface Props {
  sales: Sale[]
}

export function RecentSalesFeed({ sales }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="card-title-upper">
        Recent Sales
      </span>
      <div className="card p-4">
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
                  <span className="badge-grail font-medium">
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
    </div>
  )
}
