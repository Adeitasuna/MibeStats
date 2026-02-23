import { TokenCard } from '@/components/traits/TokenCard'
import type { Token } from '@/types'
import { magicEdenUrl } from '@/types'

interface Props {
  tokens: Token[]
}

export function HoldingsGrid({ tokens }: Props) {
  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <p className="text-gray-400 text-lg font-medium">No Miberas found</p>
        <p className="text-sm text-gray-600">
          This wallet does not hold any Mibera333 tokens — or owner data may be up to 24 hours
          stale. Try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {tokens.map((token) => (
        <TokenCard
          key={token.tokenId}
          token={{ ...token, magicEdenUrl: magicEdenUrl(token.tokenId) }}
        />
      ))}
    </div>
  )
}
