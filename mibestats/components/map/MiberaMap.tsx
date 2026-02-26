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
  const hasFilters = Object.keys(activeFilters).length > 0

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

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-mibe-gold uppercase tracking-wider">
            Filters
          </h3>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-mibe-cyan hover:text-white transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {FILTER_KEYS.map((def) => (
            <div key={def.key}>
              <label htmlFor={`map-filter-${def.key}`} className="text-[9px] text-mibe-text-2 uppercase tracking-wider block mb-0.5">
                {def.label}
              </label>
              <select
                id={`map-filter-${def.key}`}
                value={activeFilters[def.key] ?? ''}
                onChange={(e) => setFilter(def.key, e.target.value)}
                className="w-full px-1.5 py-1 rounded bg-mibe-card border border-mibe-border text-white text-[11px] focus:border-mibe-gold focus:outline-none"
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

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-mibe-text-2">
        <span>
          <strong className="text-white">{data?.total?.toLocaleString() ?? '...'}</strong> miberas on map
        </span>
        {loading && <span className="text-mibe-gold animate-pulse text-xs">Loading...</span>}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>

      {/* Map */}
      <div className="card overflow-hidden" style={{ height: 600 }}>
        {initialLoad.current && loading ? (
          <div className="w-full h-full flex items-center justify-center bg-mibe-card">
            <span className="text-mibe-text-2 animate-pulse">Loading 10,000 birth locations...</span>
          </div>
        ) : (
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
        )}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-mibe-gold mb-3 uppercase tracking-wider">
          Ancestor Legend
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {(data?.ancestors ?? Object.keys(ANCESTOR_COLORS)).map((ancestor) => (
            <button
              key={ancestor}
              onClick={() => setFilter('ancestor', activeFilters.ancestor === ancestor ? '' : ancestor)}
              className="flex items-center gap-1.5 text-xs text-mibe-text-2 hover:text-white transition-colors"
              aria-label={`Filter by ancestor: ${ancestor}`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getAncestorColor(ancestor) }}
              />
              <span className={activeFilters.ancestor === ancestor ? 'text-white font-medium' : ''}>
                {ancestor}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
