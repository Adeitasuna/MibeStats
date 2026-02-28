'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// ── Color palettes ──────────────────────────────────────────────────────

const ANCESTOR_COLORS: Record<string, string> = {
  Greek: '#ffd700', Indian: '#ff6b35', Chinese: '#ff69b4', Japanese: '#e63946',
  Egyptian: '#f4a261', Roman: '#8338ec', Persian: '#06d6a0', Celtic: '#118ab2',
  Viking: '#264653', Aztec: '#e76f51', Mayan: '#2a9d8f', Inca: '#e9c46a',
  Sumerian: '#f4845f', Babylonian: '#7209b7', Mongol: '#3a0ca3', Ottoman: '#4361ee',
  Polynesian: '#4cc9f0', African: '#fb5607', Aboriginal: '#ff006e', Norse: '#8ac926',
  Tibetan: '#ffbe0b', Korean: '#3f37c9', Thai: '#480ca8', Slavic: '#b5179e',
  Arabic: '#560bad', Native: '#7400b8', Mesopotamian: '#6930c3', Hebrew: '#5390d9',
  Phoenician: '#4ea8de', Etruscan: '#48bfe3', Minoan: '#56cfe1', Mycenaean: '#64dfdf',
  Hittite: '#72efdd',
}

const ELEMENT_COLORS: Record<string, string> = {
  Earth: '#3fb950', Fire: '#f85149', Water: '#58a6ff', Air: '#bc8cff',
}

const SWAG_RANK_COLORS: Record<string, string> = {
  Common: '#8b949e', Uncommon: '#3fb950', Rare: '#58a6ff',
  Epic: '#bc8cff', Legendary: '#ffd700', Mythical: '#ff006e',
}

const ZODIAC_COLORS: Record<string, string> = {
  Aries: '#f85149', Taurus: '#3fb950', Gemini: '#ffd700', Cancer: '#58a6ff',
  Leo: '#ff6b35', Virgo: '#8ac926', Libra: '#bc8cff', Scorpio: '#e63946',
  Sagittarius: '#f4a261', Capricorn: '#264653', Aquarius: '#4cc9f0', Pisces: '#7209b7',
}

// Known color maps per category
const KNOWN_COLORS: Partial<Record<ColorByKey, Record<string, string>>> = {
  ancestor: ANCESTOR_COLORS,
  element: ELEMENT_COLORS,
  swagRank: SWAG_RANK_COLORS,
  sunSign: ZODIAC_COLORS,
  moonSign: ZODIAC_COLORS,
  ascendingSign: ZODIAC_COLORS,
}

// Generate distinct hue-based colors for unknown categories
const GENERATED_PALETTE = [
  '#ffd700', '#ff6b35', '#ff69b4', '#e63946', '#f4a261', '#8338ec', '#06d6a0',
  '#118ab2', '#e76f51', '#2a9d8f', '#e9c46a', '#f4845f', '#7209b7', '#4361ee',
  '#4cc9f0', '#fb5607', '#ff006e', '#8ac926', '#ffbe0b', '#3f37c9', '#480ca8',
  '#b5179e', '#560bad', '#7400b8', '#6930c3', '#5390d9', '#4ea8de', '#48bfe3',
  '#56cfe1', '#64dfdf', '#72efdd', '#3a0ca3', '#bc8cff', '#58a6ff', '#3fb950',
]

function buildColorMap(values: string[], known?: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {}
  let paletteIdx = 0
  for (const v of values) {
    if (known?.[v]) {
      map[v] = known[v]
    } else {
      map[v] = GENERATED_PALETTE[paletteIdx % GENERATED_PALETTE.length]
      paletteIdx++
    }
  }
  return map
}

// ── Types ───────────────────────────────────────────────────────────────

interface MapPoint {
  id: number
  lat: number
  lng: number
  ancestor: string
  archetype: string
  element: string | null
  timePeriod: string
  swagRank: string
  sunSign: string | null
  moonSign: string | null
  ascendingSign: string | null
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

const COLOR_BY_OPTIONS = [
  { key: 'ancestor',      label: 'Ancestor' },
  { key: 'archetype',     label: 'Archetype' },
  { key: 'element',       label: 'Element' },
  { key: 'timePeriod',    label: 'Time Period' },
  { key: 'swagRank',      label: 'Swag Rank' },
  { key: 'sunSign',       label: 'Sun Sign' },
  { key: 'moonSign',      label: 'Moon Sign' },
  { key: 'ascendingSign', label: 'Ascending' },
] as const

type ColorByKey = typeof COLOR_BY_OPTIONS[number]['key']

const FILTER_KEYS = COLOR_BY_OPTIONS
type FilterKey = ColorByKey

function getPointValue(point: MapPoint, key: ColorByKey): string | null {
  switch (key) {
    case 'ancestor':      return point.ancestor
    case 'archetype':     return point.archetype
    case 'element':       return point.element
    case 'timePeriod':    return point.timePeriod
    case 'swagRank':      return point.swagRank
    case 'sunSign':       return point.sunSign
    case 'moonSign':      return point.moonSign
    case 'ascendingSign': return point.ascendingSign
  }
}

// ── Component ───────────────────────────────────────────────────────────

export function MiberaMap() {
  const [data, setData] = useState<MapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterKey, string>>>({})
  const [filterOptions, setFilterOptions] = useState<MapFilters | null>(null)
  const [colorBy, setColorBy] = useState<ColorByKey>('ancestor')
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

  // Build color map + legend from current points
  const { colorMap, legendEntries } = useMemo(() => {
    const points = data?.points ?? []
    const valuesSet = new Set<string>()
    for (const p of points) {
      const v = getPointValue(p, colorBy)
      if (v) valuesSet.add(v)
    }
    const sorted = Array.from(valuesSet).sort()
    const known = KNOWN_COLORS[colorBy]
    const cm = buildColorMap(sorted, known)
    return { colorMap: cm, legendEntries: sorted.map((v) => ({ value: v, color: cm[v] })) }
  }, [data, colorBy])

  function getColor(point: MapPoint): string {
    const v = getPointValue(point, colorBy)
    return v ? (colorMap[v] ?? '#8b949e') : '#8b949e'
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
    <div className="flex flex-col gap-3">
      {/* Stats bar */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-mibe-text-2">
          <strong className="text-white text-lg tabular-nums">{data?.total?.toLocaleString() ?? '...'}</strong>{' '}
          miberas
        </span>
        {loading && (
          <span className="inline-flex items-center gap-1.5 text-mibe-gold text-xs">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
              <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        )}
        {error && <span className="text-mibe-red text-xs">{error}</span>}
      </div>

      {/* Color-by selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.65rem', color: '#ffd700', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Color by
        </span>
        {COLOR_BY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setColorBy(opt.key)}
            className="font-terminal"
            style={{
              padding: '0.2rem 0.5rem',
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

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
        {FILTER_KEYS.map((def) => (
          <div key={def.key} style={{ flex: '1 1 0', minWidth: '100px' }}>
            <label
              htmlFor={`map-filter-${def.key}`}
              style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700', marginBottom: '0.25rem' }}
            >
              {def.label}
            </label>
            <select
              id={`map-filter-${def.key}`}
              value={activeFilters[def.key] ?? ''}
              onChange={(e) => setFilter(def.key, e.target.value)}
              className="font-terminal"
              style={{
                width: '100%',
                padding: '0.3rem 0.4rem',
                fontSize: '0.7rem',
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
              {getOptions(def.key).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
        {filterCount > 0 && (
          <button
            onClick={clearFilters}
            style={{ fontSize: '0.65rem', color: '#555', cursor: 'pointer', background: 'none', border: 'none', paddingBottom: '0.3rem' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#555')}
          >
            Clear
          </button>
        )}
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
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Legend (1/6) + Map (5/6) */}
      <div style={{ display: 'flex', gap: '0.5rem', height: '500px' }}>
        {/* Legend sidebar */}
        <div
          className="stat-card"
          style={{
            width: 'calc(100% / 6)',
            minWidth: '120px',
            padding: '0.5rem',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffd700', marginBottom: '0.5rem' }}>
            {COLOR_BY_OPTIONS.find((o) => o.key === colorBy)?.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {legendEntries.map((entry) => (
              <div
                key={entry.value}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                onClick={() => setFilter(colorBy, activeFilters[colorBy] === entry.value ? '' : entry.value)}
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
                    fontSize: '0.6rem',
                    color: activeFilters[colorBy] === entry.value ? '#fff' : '#888',
                    fontWeight: activeFilters[colorBy] === entry.value ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="stat-card" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
          <style>{`.mibemap .leaflet-tile-pane { filter: brightness(1.6) saturate(0.7); }`}</style>
          <MapContainer
            className="mibemap"
            center={[25, 20]}
            zoom={3}
            minZoom={2}
            maxBounds={[[-60, -180], [75, 180]]}
            maxBoundsViscosity={0.8}
            preferCanvas={true}
            style={{ height: '100%', width: '100%', background: '#151d2b' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {(data?.points ?? []).map((point) => {
              const c = getColor(point)
              return (
                <CircleMarker
                  key={point.id}
                  center={[point.lat, point.lng]}
                  radius={point.isGrail ? 5 : 2.5}
                  pathOptions={{
                    color: c,
                    fillColor: c,
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
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
