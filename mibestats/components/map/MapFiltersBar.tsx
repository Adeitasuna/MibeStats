'use client'

import { COLOR_BY_OPTIONS, type ColorByKey } from './map-colors'
import { FILTER_KEYS, type FilterKey } from './map-types'

interface MapFiltersBarProps {
  colorBy: ColorByKey
  onColorByChange: (key: ColorByKey) => void
  activeFilters: Partial<Record<FilterKey, string>>
  onFilterChange: (key: FilterKey, value: string) => void
  filterOptions: (key: FilterKey) => string[]
  filterCount: number
  onClearFilters: () => void
}

export function MapFiltersBar({ colorBy, onColorByChange, activeFilters, onFilterChange, filterOptions, filterCount, onClearFilters }: MapFiltersBarProps) {
  return (
    <>
      {/* Color-by selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: '#ffd700', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Color by
        </span>
        {COLOR_BY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onColorByChange(opt.key)}
            className="font-terminal"
            style={{
              padding: '0.2rem 0.4rem',
              fontSize: '0.7rem',
              borderRadius: '0.25rem',
              border: '1px solid',
              borderColor: colorBy === opt.key ? '#ffd700' : '#2a2a2a',
              background: colorBy === opt.key ? 'rgba(255,215,0,0.15)' : 'transparent',
              color: colorBy === opt.key ? '#ffd700' : '#888',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters — responsive grid */}
      <div id="map-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', alignItems: 'end', marginTop: '1rem' }}>
        {FILTER_KEYS.map((def) => (
          <div key={def.key}>
            <label
              htmlFor={`map-filter-${def.key}`}
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700', marginBottom: '0.25rem' }}
            >
              {def.label}
            </label>
            <select
              id={`map-filter-${def.key}`}
              value={activeFilters[def.key] ?? ''}
              onChange={(e) => onFilterChange(def.key, e.target.value)}
              className="font-terminal"
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                fontSize: '0.85rem',
                color: activeFilters[def.key] ? '#ffd700' : '#e0e0e0',
                background: '#0a0a0a',
                border: '1px solid',
                borderColor: activeFilters[def.key] ? 'rgba(255,215,0,0.4)' : '#2a2a2a',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">All</option>
              {filterOptions(def.key).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
        {filterCount > 0 && (
          <button
            onClick={onClearFilters}
            style={{ fontSize: '0.8rem', color: '#555', cursor: 'pointer', background: 'none', border: 'none', paddingBottom: '0.3rem' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#555')}
          >
            Clear
          </button>
        )}
      </div>
    </>
  )
}
