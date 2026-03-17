'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { PacManLoader } from '@/components/ui/PacManLoader'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { KNOWN_COLORS, buildColorMap, getPointValue, type ColorByKey } from './map-colors'
import type { MapPoint, MapFilters, MapResponse, FilterKey } from './map-types'
import { MapFiltersBar } from './MapFiltersBar'
import { MapLegend } from './MapLegend'

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
      <PacManLoader />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <MapFiltersBar
        colorBy={colorBy}
        onColorByChange={setColorBy}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        filterOptions={getOptions}
        filterCount={filterCount}
        onClearFilters={clearFilters}
      />

      {/* Legend + Map */}
      <div id="map-layout" style={{ display: 'flex', gap: '0.5rem', height: 'calc(100vh - 220px - 5rem)', minHeight: '400px', marginTop: '1rem' }}>
        <MapLegend
          data={data}
          loading={loading}
          error={error}
          colorBy={colorBy}
          legendEntries={legendEntries}
          activeFilters={activeFilters}
          onFilterChange={setFilter}
        />

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
