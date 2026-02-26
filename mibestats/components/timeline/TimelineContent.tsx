'use client'

import { useEffect, useState, useCallback } from 'react'
import { TimelineTreemap } from '@/components/charts/Treemap'

interface YearData {
  year: number
  era: string
  count: number
  label: string
}

interface Filters {
  timePeriods: string[]
  moonSigns: string[]
  sunSigns: string[]
  elements: string[]
  archetypes: string[]
  ascendingSigns: string[]
}

interface TimelineResponse {
  data: YearData[]
  filters: Filters
}

const FILTER_DEFS = [
  { key: 'timePeriod',    label: 'Time Period' },
  { key: 'moonSign',      label: 'Moon Sign' },
  { key: 'sunSign',       label: 'Sun Sign' },
  { key: 'element',       label: 'Element' },
  { key: 'archetype',     label: 'Archetype' },
  { key: 'ascendingSign', label: 'Ascending Sign' },
] as const

type FilterKey = typeof FILTER_DEFS[number]['key']

function getFilterOptions(filters: Filters, key: FilterKey): string[] {
  switch (key) {
    case 'timePeriod':    return filters.timePeriods
    case 'moonSign':      return filters.moonSigns
    case 'sunSign':       return filters.sunSigns
    case 'element':       return filters.elements
    case 'archetype':     return filters.archetypes
    case 'ascendingSign': return filters.ascendingSigns
  }
}

export function TimelineContent() {
  const [response, setResponse] = useState<TimelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterKey, string>>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) params.set(key, value)
    }
    try {
      const res = await fetch(`/api/tokens/timeline?${params.toString()}`)
      const data = await res.json()
      setResponse(data)
    } catch {
      // ignore
    }
    setLoading(false)
  }, [activeFilters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setFilter = (key: FilterKey, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      if (value === '' || prev[key] === value) {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  const clearFilters = () => setActiveFilters({})

  const treemapData = (response?.data ?? []).map((d) => ({
    name: d.label,
    size: d.count,
    year: d.year,
    era: d.era,
  }))

  const totalMiberas = treemapData.reduce((sum, d) => sum + d.size, 0)
  const hasFilters = Object.keys(activeFilters).length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">
            Filters
          </h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-mibe-cyan hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FILTER_DEFS.map((def) => (
            <div key={def.key}>
              <label className="text-[10px] text-mibe-text-2 uppercase tracking-wider block mb-1">
                {def.label}
              </label>
              <select
                value={activeFilters[def.key] ?? ''}
                onChange={(e) => setFilter(def.key, e.target.value)}
                className="w-full px-2 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-white text-xs focus:border-mibe-gold focus:outline-none"
              >
                <option value="">All</option>
                {response?.filters && getFilterOptions(response.filters, def.key).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-mibe-text-2">
        <span>
          <strong className="text-white">{totalMiberas.toLocaleString()}</strong> miberas across{' '}
          <strong className="text-white">{treemapData.length}</strong> years
        </span>
        {hasFilters && (
          <span className="bg-mibe-gold/15 text-mibe-gold px-2 py-0.5 rounded text-xs">
            Filtered
          </span>
        )}
      </div>

      {/* Treemap */}
      {loading ? (
        <div className="card p-8 h-[540px] animate-pulse flex items-center justify-center">
          <span className="text-mibe-text-2">Loading timeline data...</span>
        </div>
      ) : (
        <TimelineTreemap data={treemapData} />
      )}
    </div>
  )
}
