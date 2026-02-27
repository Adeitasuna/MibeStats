'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'

interface MiladyToken {
  tokenId: number
  miladyImageUrl: string
  miberaImageUrl: string | null
  swagRank: string
  isGrail: boolean
  grailName: string | null
  ancestor: string
  archetype: string
  lastSalePrice: number | null
  maxSalePrice: number | null
}

interface MiladiesResponse {
  data: MiladyToken[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  totalPages: number
}

export function MiladiesContent() {
  const [response, setResponse] = useState<MiladiesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page))
    try {
      const res = await fetch(`/api/tokens/miladies?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResponse(data)
    } catch {
      setError('Failed to load data. Please try again.')
    }
    setLoading(false)
  }, [search, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mibe-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={100}
              placeholder="ID, name, ancestor..."
              aria-label="Search miladies by ID, name, ancestor, or archetype"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-mibe-bg border border-mibe-border text-white text-xs placeholder:text-mibe-muted focus:border-mibe-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-mibe-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shrink-0"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 text-xs hover:text-white hover:border-mibe-gold transition-colors shrink-0"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 text-sm">
          {response && (
            <span className="text-mibe-text-2">
              <strong className="text-white tabular-nums">{response.total.toLocaleString()}</strong> miladies
            </span>
          )}
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
      </div>

      {/* Grid — 7 columns */}
      {loading && !response ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <img src="/waiting.gif" alt="Loading..." style={{ maxWidth: '300px', imageRendering: 'pixelated' }} />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {(response?.data ?? []).map((token) => (
            <div
              key={token.tokenId}
              className="card overflow-hidden group hover:border-mibe-magenta transition-colors"
            >
              {/* Milady image */}
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={token.miladyImageUrl}
                  alt={`Milady #${token.tokenId}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
                  unoptimized
                />
                {token.isGrail && (
                  <div className="absolute top-1 right-1 bg-mibe-gold/90 text-black text-[8px] font-bold px-1 py-0.5 rounded">
                    GRAIL
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-medium text-white truncate">
                    #{token.tokenId}
                  </span>
                  <SwagRankBadge rank={token.swagRank} size="sm" />
                </div>

                {/* Prices */}
                <div className="flex justify-between text-[9px]">
                  <div className="flex flex-col">
                    <span className="text-mibe-muted">Max</span>
                    <span className="text-white font-medium tabular-nums">
                      {token.maxSalePrice != null ? `${token.maxSalePrice.toFixed(1)}` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-mibe-muted">Last</span>
                    <span className="text-white font-medium tabular-nums">
                      {token.lastSalePrice != null ? `${token.lastSalePrice.toFixed(1)}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {response && response.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-mibe-text-2 tabular-nums">
            Page {response.page} / {response.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={response.page <= 1}
              aria-label="First page"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={response.page <= 1}
              aria-label="Previous page"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!response.hasNext}
              aria-label="Next page"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setPage(response.totalPages)}
              disabled={!response.hasNext}
              aria-label="Last page"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7m-8-14l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
