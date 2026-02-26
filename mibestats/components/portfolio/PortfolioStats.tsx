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
        ? `${stats.estimatedValue.toFixed(2)} BERA`
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
        <div key={label} className="card-gold p-3 flex flex-col gap-0.5">
          <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">{label}</span>
          <span className="text-lg font-bold text-white tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}
