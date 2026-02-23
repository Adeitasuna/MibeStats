import { clsx } from 'clsx'
import type { SwagRank } from '@/types'

interface Props {
  rank: string
  size?: 'sm' | 'md'
}

export function SwagRankBadge({ rank, size = 'md' }: Props) {
  return (
    <span
      className={clsx(
        `rank-${rank}`,
        'inline-flex items-center justify-center font-bold rounded uppercase tracking-wider',
        size === 'sm'  ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
      )}
    >
      {rank}
    </span>
  )
}
