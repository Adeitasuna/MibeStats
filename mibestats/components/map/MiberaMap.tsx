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
    const controller = new AbortController()
    fetch('/api/traits', { signal: controller.signal })
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
      .catch((err) => {
        if (err.name !== 'AbortError') { /* swallow */ }
      })
    return () => controller.abort()
  }, [])

  const fetchPoints = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) params.set(key, value)
    }
    try {
      const res = await fetch(`/api/tokens/map?${params.toString()}`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to load map data. Please try again.')
    }
    setLoading(false)
    initialLoad.current = false
  }, [activeFilters])

  useEffect(() => {
    const controller = new AbortController()
    fetchPoints(controller.signal)
    return () => controller.abort()
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
  const filterCount = Object.values(activeFilters).filter(Boolean).length

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
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <img src="/waiting.gif" alt="Loading..." className="max-w-[300px]" style={{ imageRendering: 'pixelated' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Color-by selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-mibe-gold font-semibold uppercase tracking-wide">
          Color by
        </span>
        {COLOR_BY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setColorBy(opt.key)}
            className={`font-terminal px-2.5 py-1 text-sm rounded border cursor-pointer ${
              colorBy === opt.key
                ? 'border-mibe-gold bg-mibe-gold/15 text-mibe-gold'
                : 'border-mibe-border bg-transparent text-mibe-text-2'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters — extra top spacing */}
      <div className="flex items-end gap-3 flex-wrap mt-4">
        {FILTER_KEYS.map((def) => (
          <div key={def.key} className="flex-[1_1_0] min-w-[100px]">
            <label
              htmlFor={`map-filter-${def.key}`}
              className="block text-xs font-semibold uppercase tracking-wide text-mibe-gold mb-1"
            >
              {def.label}
            </label>
            <select
              id={`map-filter-${def.key}`}
              value={activeFilters[def.key] ?? ''}
              onChange={(e) => setFilter(def.key, e.target.value)}
              className={`font-terminal w-full py-1.5 px-2 text-sm bg-mibe-bg border rounded cursor-pointer outline-none ${
                activeFilters[def.key]
                  ? 'text-mibe-gold border-mibe-gold/40'
                  : 'text-[#e0e0e0] border-mibe-border'
              }`}
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
            className="text-xs text-mibe-muted cursor-pointer bg-transparent border-none pb-1 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Legend (1/6) + Map (5/6) */}
      <div className="flex gap-2 h-[500px] mt-4">
        {/* Legend sidebar */}
        <div
          className="stat-card w-1/6 min-w-[120px] p-2 overflow-y-auto shrink-0"
        >
          {/* Count + loading */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <strong className="font-terminal text-white text-base">
              {data?.total?.toLocaleString() ?? '...'}
            </strong>
            <span className="font-terminal text-mibe-text-2 text-xs">miberas</span>
            {loading && (
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', color: '#ffd700' }}>
                <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
          {error && <div className="font-terminal text-mibe-red text-xs mb-1">{error}</div>}

          {/* Separator */}
          <div className="border-t border-mibe-border mb-1.5" />

          {/* Category title */}
          <div className="text-xs font-semibold uppercase tracking-wide text-mibe-gold mb-1">
            {COLOR_BY_OPTIONS.find((o) => o.key === colorBy)?.label}
          </div>

          {/* Legend items */}
          <div className="flex flex-col gap-0.5">
            {legendEntries.map((entry) => {
              const isActive = activeFilters[colorBy] === entry.value
              return (
                <div
                  key={entry.value}
                  className="flex items-center gap-1.5 cursor-pointer"
                  onClick={() => setFilter(colorBy, isActive ? '' : entry.value)}
                >
                  <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span
                    className={`font-terminal text-xs whitespace-nowrap overflow-hidden text-ellipsis flex-1 ${
                      isActive ? 'text-white font-semibold' : 'text-mibe-text-2 font-normal'
                    }`}
                  >
                    {entry.value}
                  </span>
                  {isActive && (
                    <span className="text-mibe-red text-sm font-bold shrink-0 leading-none">×</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Map */}
        <div className="stat-card flex-1 overflow-hidden p-0">
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
