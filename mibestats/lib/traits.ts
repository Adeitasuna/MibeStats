import type { TraitCount } from '@/types'

export function toTraitCounts(
  rows: { value: string | null; count: bigint }[],
  total = 10000,
): TraitCount[] {
  return rows
    .filter((r) => r.value !== null)
    .map((r) => ({
      value: r.value as string,
      count: Number(r.count),
      pct:   Math.round((Number(r.count) / total) * 10000) / 100,
    }))
    .sort((a, b) => b.count - a.count)
}
