// Shared chart constants — used by PieChartGrid, TraitDistributionChart, DistributionContent, Treemap

export const CHART_COLORS = [
  '#ffd700', '#58a6ff', '#ff69b4', '#3fb950', '#f85149',
  '#bc8cff', '#f0883e', '#8b949e', '#db61a2', '#79c0ff',
  '#56d364', '#ffa657', '#ff7b72', '#d2a8ff', '#a5d6ff',
  '#7ee787', '#ffc680', '#ffa198', '#e2c5ff', '#c8e1ff',
]

export const TOOLTIP_STYLE: React.CSSProperties = {
  background: '#000',
  border: '1px solid #ffd700',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 11,
}

export const TIER_COLORS: Record<string, string> = {
  whale: '#ffd700',
  diamond: '#b9f2ff',
  gold: '#f0a030',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  holder: '#555',
}

/** Color scale: dark blue → gold based on value ratio */
export function getTreemapColor(count: number, maxCount: number): string {
  const ratio = Math.min(count / maxCount, 1)
  const r = Math.round(26 + ratio * (255 - 26))
  const g = Math.round(26 + ratio * (215 - 26))
  const b = Math.round(46 + ratio * (0 - 46))
  return `rgb(${r}, ${g}, ${b})`
}
