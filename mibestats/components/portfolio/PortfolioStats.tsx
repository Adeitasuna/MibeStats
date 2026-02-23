import type { PortfolioStats as Stats } from '@/types'

interface Props {
  stats: Stats
}

export function PortfolioStats({ stats }: Props) {
  const cards = [
    {
      label: 'Miberas held',
      value: stats.count.toString(),
    },
    {
      label: 'Est. portfolio value',
      value: stats.estimatedValue != null
        ? `${stats.estimatedValue.toFixed(2)} Ƀ`
        : '—',
    },
    {
      label: 'Avg rarity rank',
      value: stats.avgRarityRank != null ? `#${stats.avgRarityRank}` : '—',
    },
    {
      label: 'Highest swag score',
      value: stats.highestSwagScore != null ? stats.highestSwagScore.toString() : '—',
    },
    {
      label: 'Grails held',
      value: stats.grailCount.toString(),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value }) => (
        <div key={label} className="card p-4 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
          <span className="text-xl font-bold text-white">{value}</span>
        </div>
      ))}
    </div>
  )
}
