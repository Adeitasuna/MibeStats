'use client'

import { useEffect, useState } from 'react'
import { PieChartGrid } from '@/components/charts/PieChartGrid'
import type { TraitDistribution, TraitCount } from '@/types'

const CHART_SECTIONS: Array<{ key: keyof TraitDistribution; title: string }> = [
  { key: 'swagRanks',      title: 'Swag Rank' },
  { key: 'elements',       title: 'Element' },
  { key: 'archetypes',     title: 'Archetype' },
  { key: 'timePeriods',    title: 'Time Period' },
  { key: 'ancestors',      title: 'Ancestor' },
  { key: 'ascendingSigns', title: 'Ascending Sign' },
  { key: 'sunSigns',       title: 'Sun Sign' },
  { key: 'moonSigns',      title: 'Moon Sign' },
  { key: 'bodies',         title: 'Body' },
  { key: 'eyebrows',       title: 'Eyebrows' },
  { key: 'mouths',         title: 'Mouth' },
  { key: 'glasses',        title: 'Glasses' },
  { key: 'masks',          title: 'Mask' },
  { key: 'earrings',       title: 'Earrings' },
  { key: 'drugs',          title: 'Drug' },
  { key: 'faceAccessories', title: 'Face Accessory' },
  { key: 'hairs',          title: 'Hair' },
  { key: 'hats',           title: 'Hat' },
  { key: 'items',          title: 'Item' },
  { key: 'eyes',           title: 'Eyes' },
  { key: 'shirts',         title: 'Shirt' },
  { key: 'backgrounds',    title: 'Background' },
  { key: 'tattoos',        title: 'Tattoo' },
  { key: 'grailCategories', title: 'Grail Category' },
]

export function DistributionContent() {
  const [traits, setTraits] = useState<TraitDistribution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/traits')
      .then((res) => res.json())
      .then((data) => { setTraits(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="card p-4 h-[260px] animate-pulse">
            <div className="h-3 bg-white/5 rounded w-24 mb-3" />
            <div className="h-[200px] bg-white/5 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!traits) {
    return (
      <div className="card p-8 text-center text-mibe-text-2">
        Failed to load trait distribution data.
      </div>
    )
  }

  const sections = CHART_SECTIONS
    .map((s) => {
      const data = traits[s.key]
      return {
        title: s.title,
        data: Array.isArray(data) ? (data as TraitCount[]) : [],
      }
    })
    .filter((s) => s.data.length > 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Main trait pie charts */}
      <PieChartGrid sections={sections} />

      {/* Chronos Area — Time Period breakdown */}
      <section>
        <h2 className="section-title text-xl mb-4">Chronos Area</h2>
        <p className="text-mibe-text-2 text-sm mb-4">
          Distribution by historical time period
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-mibe-gold mb-2 uppercase tracking-wider">
              Time Period Split
            </h3>
            <div className="flex flex-col gap-2">
              {(traits.timePeriods || []).map((tp) => (
                <div key={tp.value} className="flex items-center gap-3">
                  <span className="text-sm text-white w-20">{tp.value}</span>
                  <div className="flex-1 h-6 bg-mibe-hover rounded-md overflow-hidden">
                    <div
                      className="h-full bg-mibe-gold/70 rounded-md flex items-center px-2"
                      style={{ width: `${tp.pct}%` }}
                    >
                      <span className="text-[10px] font-bold text-black">
                        {tp.count.toLocaleString()} ({tp.pct}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-mibe-gold mb-2 uppercase tracking-wider">
              Element by Time Period
            </h3>
            <div className="flex flex-col gap-2">
              {(traits.elements || []).map((el) => {
                const colors: Record<string, string> = {
                  Earth: '#3fb950', Fire: '#f85149', Water: '#58a6ff', Air: '#bc8cff',
                }
                return (
                  <div key={el.value} className="flex items-center gap-3">
                    <span className="text-sm text-white w-16">{el.value}</span>
                    <div className="flex-1 h-6 bg-mibe-hover rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md flex items-center px-2"
                        style={{
                          width: `${el.pct}%`,
                          backgroundColor: colors[el.value] ?? '#8b949e',
                          opacity: 0.7,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {el.count.toLocaleString()} ({el.pct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
