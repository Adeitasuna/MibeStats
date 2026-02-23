import Image from 'next/image'
import Link from 'next/link'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Sale } from '@/types'
import { magicEdenUrl } from '@/types'

interface Props {
  sales: Sale[]
}

export function TopSales({ sales }: Props) {
  return (
    <div className="card p-4">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Top Sales (All-Time)
      </h2>

      <ol className="flex flex-col gap-2">
        {sales.map((sale, i) => (
          <li key={sale.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
            <span className="text-sm font-mono text-gray-600 w-5 shrink-0">
              {i + 1}
            </span>

            <Link href={magicEdenUrl(sale.tokenId)} target="_blank" rel="noreferrer" className="shrink-0">
              {sale.token?.imageUrl ? (
                <Image
                  src={sale.token.imageUrl}
                  alt={`Mibera #${sale.tokenId}`}
                  width={36}
                  height={36}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-md bg-white/5" />
              )}
            </Link>

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
                {sale.token?.swagRank && <SwagRankBadge rank={sale.token.swagRank} size="sm" />}
                {sale.token?.isGrail && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1 py-0.5 rounded">
                    GRAIL
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {new Date(sale.soldAt).toLocaleDateString()}
              </div>
            </div>

            <span className="text-sm font-bold text-white shrink-0">
              {sale.priceBera.toFixed(2)} <span className="text-yellow-400">Ƀ</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
