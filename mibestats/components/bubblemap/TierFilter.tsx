'use client'

import { TIER_COLORS } from '@/lib/chart-constants'
import { TIERS, TIER_LABELS } from './bubblemap-constants'

interface TierFilterProps {
  activeTiers: Set<string>
  onToggle: (tier: string) => void
}

export function TierFilter({ activeTiers, onToggle }: TierFilterProps) {
  return (
    <div className="col-span-3 flex flex-col gap-1">
      <span className="card-title-upper">Filter by Tier</span>
      <div className="flex gap-1.5 flex-wrap">
        {TIERS.map((tier) => {
          const active = activeTiers.has(tier)
          return (
            <button
              key={tier}
              onClick={() => onToggle(tier)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                active ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
              style={active ? { borderBottom: `2px solid ${TIER_COLORS[tier]}` } : undefined}
            >
              {TIER_LABELS[tier]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
