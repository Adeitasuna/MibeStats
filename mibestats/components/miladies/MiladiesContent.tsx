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
    <div className="flex flex-col gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          maxLength={100}
          placeholder="Search by ID, name, ancestor, archetype..."
          aria-label="Search miladies by ID, name, ancestor, or archetype"
          className="flex-1 max-w-md px-3 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-white text-sm placeholder:text-mibe-muted focus:border-mibe-gold focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-md bg-mibe-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="px-3 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-mibe-text-2 text-sm hover:border-mibe-gold transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Stats */}
      <div className="text-sm text-mibe-text-2">
        {response && (
          <span>
            Showing <strong className="text-white">{response.data.length}</strong> of{' '}
            <strong className="text-white">{response.total.toLocaleString()}</strong>
            {response.totalPages > 1 && (
              <> — Page {response.page} of {response.totalPages}</>
            )}
          </span>
        )}
        {loading && <span className="text-mibe-gold animate-pulse ml-2">Loading...</span>}
        {error && <span className="text-red-400 ml-2">{error}</span>}
      </div>

      {/* Grid — 7 columns */}
      {loading && !response ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className="card aspect-square animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
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
              <div className="p-2 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-white truncate">
                    Mibera {token.tokenId}
                  </span>
                  <SwagRankBadge rank={token.swagRank} size="sm" />
                </div>

                {/* Prices */}
                <div className="flex justify-between text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-mibe-muted">Max</span>
                    <span className="text-white font-medium">
                      {token.maxSalePrice != null ? `${token.maxSalePrice.toFixed(1)}` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-mibe-muted">Last</span>
                    <span className="text-white font-medium">
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
        <div className="flex items-center justify-between text-sm">
          <span className="text-mibe-text-2">
            Page {response.page} of {response.totalPages}
          </span>
          <div className="flex gap-2">
            {response.page > 1 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
                className="px-3 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-white text-sm hover:border-mibe-gold transition-colors"
              >
                Previous
              </button>
            )}
            {response.hasNext && (
              <button
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="px-3 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-white text-sm hover:border-mibe-gold transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
