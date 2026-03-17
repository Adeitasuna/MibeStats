'use client'

import { COLOR_BY_OPTIONS, type ColorByKey } from './map-colors'
import type { MapResponse, FilterKey } from './map-types'

interface MapLegendProps {
  data: MapResponse | null
  loading: boolean
  error: string | null
  colorBy: ColorByKey
  legendEntries: { value: string; color: string }[]
  activeFilters: Partial<Record<FilterKey, string>>
  onFilterChange: (key: FilterKey, value: string) => void
}

export function MapLegend({ data, loading, error, colorBy, legendEntries, activeFilters, onFilterChange }: MapLegendProps) {
  return (
    <div
      className="stat-card"
      id="map-legend"
      style={{
        width: 'calc(100% / 6)',
        minWidth: '120px',
        padding: '0.5rem',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Count + loading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <strong className="font-terminal" style={{ color: '#fff', fontSize: '1rem' }}>
          {data?.total?.toLocaleString() ?? '...'}
        </strong>
        <span className="font-terminal" style={{ color: '#888', fontSize: '0.8rem' }}>miberas</span>
        {loading && (
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', color: '#ffd700' }}>
            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>
      {error && <div className="font-terminal" style={{ color: '#f85149', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{error}</div>}

      {/* Separator */}
      <div style={{ borderTop: '1px solid #2a2a2a', marginBottom: '0.4rem' }} />

      {/* Category title */}
      <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700', marginBottom: '0.35rem' }}>
        {COLOR_BY_OPTIONS.find((o) => o.key === colorBy)?.label}
      </div>

      {/* Legend items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {legendEntries.map((entry) => {
          const isActive = activeFilters[colorBy] === entry.value
          return (
            <div
              key={entry.value}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
              onClick={() => onFilterChange(colorBy, isActive ? '' : entry.value)}
            >
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color,
                flexShrink: 0,
              }} />
              <span
                className="font-terminal"
                style={{
                  fontSize: '0.75rem',
                  color: isActive ? '#fff' : '#888',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}
              >
                {entry.value}
              </span>
              {isActive && (
                <span style={{ color: '#f85149', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>×</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
