import Image from 'next/image'
import Link from 'next/link'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Token } from '@/types'

interface Props {
  token: Token & { magicEdenUrl: string }
}

export function TokenCard({ token }: Props) {
  return (
    <Link
      href={token.magicEdenUrl}
      target="_blank"
      rel="noreferrer"
      className="card block overflow-hidden hover:border-mibe-gold transition-colors group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-mibe-hover/50">
        {token.imageUrl ? (
          <Image
            src={token.imageUrl}
            alt={`Mibera #${token.tokenId}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-mibe-muted text-xs">
            #{token.tokenId}
          </div>
        )}
        {/* Grail badge */}
        {token.isGrail && (
          <div className="absolute top-1 right-1">
            <span className="text-[8px] bg-mibe-gold/90 text-black px-1.5 py-0.5 rounded font-bold tracking-wide">
              GRAIL
            </span>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="p-2 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-white">#{token.tokenId}</span>
          <SwagRankBadge rank={token.swagRank} size="sm" />
        </div>
        {token.rarityRank != null && (
          <div className="text-[10px] text-mibe-muted">Rank #{token.rarityRank}</div>
        )}
        {token.lastSalePrice != null && (
          <div className="text-[10px] text-mibe-text-2 tabular-nums">
            {token.lastSalePrice.toFixed(2)} <span className="text-mibe-gold">BERA</span>
          </div>
        )}
      </div>
    </Link>
  )
}
