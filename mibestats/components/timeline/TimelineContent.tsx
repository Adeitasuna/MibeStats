'use client'

import { useEffect, useState } from 'react'
import { TimelineTreemap } from '@/components/charts/Treemap'

interface YearData {
  year: number
  era: string
  count: number
  label: string
}

export function TimelineContent() {
  const [data, setData] = useState<YearData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/tokens/timeline', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => setData(json.data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Failed to load timeline data. Please try again.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const treemapData = data.map((d) => ({
    name: d.label,
    size: d.count,
    year: d.year,
    era: d.era,
  }))

  // Initial load — show waiting gif like other pages
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center text-mibe-text-2">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Treemap */}
      <TimelineTreemap data={treemapData} />
    </div>
  )
}
