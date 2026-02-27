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
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterKey, string>>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) params.set(key, value)
    }
    try {
      const res = await fetch(`/api/tokens/timeline?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResponse(data)
    } catch {
      setError('Failed to load timeline data. Please try again.')
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
  const activeFilterEntries = Object.entries(activeFilters).filter(([, v]) => v)
  const filterCount = activeFilterEntries.length

  const getFilterLabel = (key: string): string => {
    return FILTER_DEFS.find((f) => f.key === key)?.label ?? key
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stats bar + filter toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-mibe-text-2">
            <strong className="text-white text-lg tabular-nums">{totalMiberas.toLocaleString()}</strong>{' '}
            miberas across{' '}
            <strong className="text-white tabular-nums">{treemapData.length}</strong> years
          </span>
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-mibe-gold text-xs">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </span>
          )}
          {error && <span className="text-mibe-red text-xs">{error}</span>}
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mibe-card border border-mibe-border text-sm text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {filterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mibe-gold text-black text-[10px] font-bold">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter pills */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilterEntries.map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterKey, '')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-mibe-gold/15 text-mibe-gold text-xs font-medium hover:bg-mibe-gold/25 transition-colors"
            >
              <span className="text-mibe-text-2">{getFilterLabel(key)}:</span> {value}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            onClick={clearFilters}
            className="text-[10px] text-mibe-muted hover:text-white transition-colors px-1.5 py-0.5"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Collapsible Filters */}
      {filtersOpen && (
        <div className="card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FILTER_DEFS.map((def) => (
              <div key={def.key}>
                <label htmlFor={`tl-filter-${def.key}`} className="text-[10px] text-mibe-text-2 uppercase tracking-wider block mb-1 font-medium">
                  {def.label}
                </label>
                <select
                  id={`tl-filter-${def.key}`}
                  value={activeFilters[def.key] ?? ''}
                  onChange={(e) => setFilter(def.key, e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-mibe-bg border border-mibe-border text-white text-xs focus:border-mibe-gold focus:outline-none appearance-none cursor-pointer"
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
      )}

      {/* Treemap */}
      {loading && !response ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
        </div>
      ) : (
        <TimelineTreemap data={treemapData} />
      )}
    </div>
  )
}
