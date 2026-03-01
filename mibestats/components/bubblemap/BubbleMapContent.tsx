'use client'

import { useEffect, useState } from 'react'
import type { BubbleMapResponse } from '@/types'
import { ForceGraph } from './ForceGraph'
import { BubbleMapStats } from './BubbleMapStats'

export function BubbleMapContent() {
  const [data, setData] = useState<BubbleMapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/bubblemap')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: BubbleMapResponse) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[BubbleMap]', err)
        setError('Failed to load bubble map data')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 10rem)' }}>
        <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card p-3 border-mibe-red text-red-400 text-sm">
        {error ?? 'No data available'}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <BubbleMapStats nodes={data.nodes} links={data.links} />
      <ForceGraph nodes={data.nodes} links={data.links} />
    </div>
  )
}
