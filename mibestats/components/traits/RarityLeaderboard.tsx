import Link from 'next/link'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Token } from '@/types'
import { magicEdenUrl as buildMEUrl } from '@/types'

interface LeaderboardToken extends Pick<
  Token,
  'tokenId' | 'archetype' | 'ancestor' | 'swagRank' | 'rarityRank' | 'isGrail' | 'grailName'
> {
  magicEdenUrl?: string
}

interface Props {
  tokens: LeaderboardToken[]
}

export function RarityLeaderboard({ tokens }: Props) {
  const sorted = [...tokens]
    .filter((t) => t.swagRank === 'SSS' || t.swagRank === 'SS')
    .sort((a, b) => (a.rarityRank ?? 9999) - (b.rarityRank ?? 9999))
    .slice(0, 100)

  if (sorted.length === 0) return null

  return (
    <div className="card p-4">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Rarity Leaderboard — Top SSS &amp; SS
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-[var(--border)]">
              <th className="pb-2 font-medium pr-4">Rank</th>
              <th className="pb-2 font-medium pr-4">Token</th>
              <th className="pb-2 font-medium pr-4">Swag</th>
              <th className="pb-2 font-medium pr-4">Archetype</th>
              <th className="pb-2 font-medium">Ancestor</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((token, i) => (
              <tr
                key={token.tokenId}
                className="border-b border-[var(--border)] last:border-0 hover:bg-white/2 transition-colors"
              >
                <td className="py-2 pr-4 text-gray-500 tabular-nums">
                  #{token.rarityRank ?? i + 1}
                </td>
                <td className="py-2 pr-4">
                  <Link
                    href={token.magicEdenUrl ?? buildMEUrl(token.tokenId)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors font-medium"
                  >
                    #{token.tokenId}
                  </Link>
                  {token.isGrail && (
                    <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded">
                      GRAIL
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  <SwagRankBadge rank={token.swagRank} size="sm" />
                </td>
                <td className="py-2 pr-4 text-gray-300">{token.archetype}</td>
                <td className="py-2 text-gray-400">{token.ancestor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
