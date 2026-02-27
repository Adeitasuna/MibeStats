'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Ancestor color palette (33 ancestors in codex)
const ANCESTOR_COLORS: Record<string, string> = {
  Greek:       '#ffd700',
  Indian:      '#ff6b35',
  Chinese:     '#ff69b4',
  Japanese:    '#e63946',
  Egyptian:    '#f4a261',
  Roman:       '#8338ec',
  Persian:     '#06d6a0',
  Celtic:      '#118ab2',
  Viking:      '#264653',
  Aztec:       '#e76f51',
  Mayan:       '#2a9d8f',
  Inca:        '#e9c46a',
  Sumerian:    '#f4845f',
  Babylonian:  '#7209b7',
  Mongol:      '#3a0ca3',
  Ottoman:     '#4361ee',
  Polynesian:  '#4cc9f0',
  African:     '#fb5607',
  Aboriginal:  '#ff006e',
  Norse:       '#8ac926',
  Tibetan:     '#ffbe0b',
  Korean:      '#3f37c9',
  Thai:        '#480ca8',
  Slavic:      '#b5179e',
  Arabic:      '#560bad',
  Native:      '#7400b8',
  Mesopotamian:'#6930c3',
  Hebrew:      '#5390d9',
  Phoenician:  '#4ea8de',
  Etruscan:    '#48bfe3',
  Minoan:      '#56cfe1',
  Mycenaean:   '#64dfdf',
  Hittite:     '#72efdd',
}

function getAncestorColor(ancestor: string): string {
  return ANCESTOR_COLORS[ancestor] ?? '#8b949e'
}

interface MapPoint {
  id: number
  lat: number
  lng: number
  ancestor: string
  archetype: string
  element: string | null
  timePeriod: string
  swagRank: string
  isGrail: boolean
}

interface MapFilters {
  timePeriods: string[]
  archetypes: string[]
  elements: string[]
  ancestors: string[]
  swagRanks: string[]
  sunSigns: string[]
  moonSigns: string[]
  ascendingSigns: string[]
}

interface MapResponse {
  points: MapPoint[]
  total: number
  ancestors: string[]
}

const FILTER_KEYS = [
  { key: 'ancestor',      label: 'Ancestor' },
  { key: 'archetype',     label: 'Archetype' },
  { key: 'element',       label: 'Element' },
  { key: 'timePeriod',    label: 'Time Period' },
  { key: 'swagRank',      label: 'Swag Rank' },
  { key: 'sunSign',       label: 'Sun Sign' },
  { key: 'moonSign',      label: 'Moon Sign' },
  { key: 'ascendingSign', label: 'Ascending Sign' },
] as const

type FilterKey = typeof FILTER_KEYS[number]['key']

// Component to fit map bounds to points — only on first load
function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap()
  const hasFitted = useRef(false)
  useEffect(() => {
    if (hasFitted.current || points.length === 0) return
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    for (const p of points) {
      if (p.lat < minLat) minLat = p.lat
      if (p.lat > maxLat) maxLat = p.lat
      if (p.lng < minLng) minLng = p.lng
      if (p.lng > maxLng) maxLng = p.lng
    }
    map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [20, 20] })
    hasFitted.current = true
  }, [map, points])
  return null
}

export function MiberaMap() {
  const [data, setData] = useState<MapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterKey, string>>>({})
  const [filterOptions, setFilterOptions] = useState<MapFilters | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const initialLoad = useRef(true)

  // Fetch filter options once
  useEffect(() => {
    fetch('/api/traits')
      .then((res) => res.json())
      .then((traits) => {
        setFilterOptions({
          ancestors:      (traits.ancestors || []).map((t: { value: string }) => t.value),
          archetypes:     (traits.archetypes || []).map((t: { value: string }) => t.value),
          elements:       (traits.elements || []).map((t: { value: string }) => t.value),
          timePeriods:    (traits.timePeriods || []).map((t: { value: string }) => t.value),
          swagRanks:      (traits.swagRanks || []).map((t: { value: string }) => t.value),
          sunSigns:       (traits.sunSigns || []).map((t: { value: string }) => t.value),
          moonSigns:      (traits.moonSigns || []).map((t: { value: string }) => t.value),
          ascendingSigns: (traits.ascendingSigns || []).map((t: { value: string }) => t.value),
        })
      })
      .catch(() => {})
  }, [])

  const fetchPoints = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) params.set(key, value)
    }
    try {
      const res = await fetch(`/api/tokens/map?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch {
      setError('Failed to load map data. Please try again.')
    }
    setLoading(false)
    initialLoad.current = false
  }, [activeFilters])

  useEffect(() => {
    fetchPoints()
  }, [fetchPoints])

  const setFilter = (key: FilterKey, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      if (value === '' || prev[key] === value) delete next[key]
      else next[key] = value
      return next
    })
  }

  const clearFilters = () => setActiveFilters({})
  const activeFilterEntries = Object.entries(activeFilters).filter(([, v]) => v)
  const filterCount = activeFilterEntries.length

  const getOptions = (key: FilterKey): string[] => {
    if (!filterOptions) return []
    switch (key) {
      case 'ancestor':      return filterOptions.ancestors
      case 'archetype':     return filterOptions.archetypes
      case 'element':       return filterOptions.elements
      case 'timePeriod':    return filterOptions.timePeriods
      case 'swagRank':      return filterOptions.swagRanks
      case 'sunSign':       return filterOptions.sunSigns
      case 'moonSign':      return filterOptions.moonSigns
      case 'ascendingSign': return filterOptions.ascendingSigns
    }
  }

  const getFilterLabel = (key: string): string => {
    return FILTER_KEYS.find((f) => f.key === key)?.label ?? key
  }

  // Show loading gif until data is ready
  if (initialLoad.current && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Stats bar + filter toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
          <span style={{ color: '#8b949e' }}>
            <strong style={{ color: '#fff', fontSize: '1.125rem' }}>{data?.total?.toLocaleString() ?? '...'}</strong>{' '}
            miberas
          </span>
          {loading && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#ffd700', fontSize: '0.75rem' }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </span>
          )}
          {error && <span style={{ color: '#f85149', fontSize: '0.75rem' }}>{error}</span>}
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#161b22', border: '1px solid #30363d', fontSize: '0.875rem', color: '#8b949e', cursor: 'pointer' }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {filterCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: '#ffd700', color: '#000', fontSize: '10px', fontWeight: 700 }}>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FILTER_KEYS.map((def) => (
              <div key={def.key}>
                <label htmlFor={`map-filter-${def.key}`} className="text-[10px] text-mibe-text-2 uppercase tracking-wider block mb-1 font-medium">
                  {def.label}
                </label>
                <select
                  id={`map-filter-${def.key}`}
                  value={activeFilters[def.key] ?? ''}
                  onChange={(e) => setFilter(def.key, e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-mibe-bg border border-mibe-border text-white text-xs focus:border-mibe-gold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All</option>
                  {getOptions(def.key).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="stat-card" style={{ overflow: 'hidden', height: '500px', padding: 0 }}>
        <MapContainer
            center={[20, 0]}
            zoom={2}
            preferCanvas={true}
            style={{ height: '100%', width: '100%', background: '#0d1117' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {(data?.points ?? []).map((point) => (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={point.isGrail ? 5 : 2.5}
                pathOptions={{
                  color: getAncestorColor(point.ancestor),
                  fillColor: getAncestorColor(point.ancestor),
                  fillOpacity: point.isGrail ? 1 : 0.7,
                  weight: point.isGrail ? 2 : 0,
                  stroke: point.isGrail,
                }}
              >
                <Popup>
                  <div className="text-xs" style={{ color: '#333' }}>
                    <strong>Mibera #{point.id}</strong>
                    {point.isGrail && <span style={{ color: '#ffd700' }}> GRAIL</span>}
                    <br />
                    Ancestor: {point.ancestor}<br />
                    Archetype: {point.archetype}<br />
                    {point.element && <>Element: {point.element}<br /></>}
                    Period: {point.timePeriod}<br />
                    Rank: {point.swagRank}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {data?.points && data.points.length > 0 && <FitBounds points={data.points} />}
          </MapContainer>
      </div>

      {/* Legend */}
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-mibe-gold uppercase tracking-wider">
            Ancestors — click to filter
          </h3>
          <span className="text-[10px] text-mibe-muted">{data?.ancestors?.length ?? Object.keys(ANCESTOR_COLORS).length} ancestors</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {(data?.ancestors ?? Object.keys(ANCESTOR_COLORS)).map((ancestor) => (
            <button
              key={ancestor}
              onClick={() => setFilter('ancestor', activeFilters.ancestor === ancestor ? '' : ancestor)}
              className="flex items-center gap-1 text-[11px] text-mibe-text-2 hover:text-white transition-colors py-0.5"
              aria-label={`Filter by ancestor: ${ancestor}`}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getAncestorColor(ancestor) }}
              />
              <span className={activeFilters.ancestor === ancestor ? 'text-white font-semibold' : ''}>
                {ancestor}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
