'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Token } from '@/types'
import { magicEdenUrl } from '@/types'

interface GrailToken extends Token {
  magicEdenUrl: string
}

interface GrailsResponse {
  total: number
  categories: Record<string, GrailToken[]>
}

type ViewMode = 'all' | 'category'

function GrailCard({ grail, showCategory }: { grail: GrailToken; showCategory?: boolean }) {
  return (
    <a
      href={magicEdenUrl(grail.tokenId)}
      target="_blank"
      rel="noreferrer"
      className="card-gold overflow-hidden group hover:shadow-lg hover:shadow-yellow-900/20 transition-all"
    >
      {/* Category label */}
      {showCategory && (
        <div className="px-2 pt-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-mibe-gold">
            {grail.grailCategory ?? 'Unknown'}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square relative m-1.5 rounded-lg overflow-hidden">
        {grail.imageUrl ? (
          <Image
            src={grail.imageUrl}
            alt={grail.grailName ?? `Mibera #${grail.tokenId}`}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 14vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-mibe-hover text-mibe-muted">
            ?
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium text-white truncate">
            {grail.grailName ?? `#${grail.tokenId}`}
          </span>
          <SwagRankBadge rank={grail.swagRank} size="sm" />
        </div>

        {/* Prices */}
        <div className="flex justify-between text-[10px]">
          <div className="flex flex-col">
            <span className="text-mibe-muted">Max</span>
            <span className="text-white font-medium tabular-nums">
              {grail.maxSalePrice != null ? `${Number(grail.maxSalePrice).toFixed(1)}` : '—'}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-mibe-muted">Last</span>
            <span className="text-white font-medium tabular-nums">
              {grail.lastSalePrice != null ? `${Number(grail.lastSalePrice).toFixed(1)}` : '—'}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export function GrailsContent() {
  const [data, setData] = useState<GrailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('all')

  useEffect(() => {
    fetch('/api/grails')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load grails data.'); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <svg className="w-8 h-8 text-mibe-gold animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-mibe-text-2 text-sm">Loading grails...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card p-8 text-center text-mibe-text-2">
        {error ?? 'Failed to load grails data.'}
      </div>
    )
  }

  const sortedCategories = Object.entries(data.categories).sort(([a], [b]) =>
    a.localeCompare(b),
  )
  const allGrails = sortedCategories.flatMap(([, tokens]) => tokens)

  return (
    <div className="flex flex-col gap-4">
      {/* View toggle + count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-mibe-text-2">
          <strong className="text-white text-lg tabular-nums">{data.total}</strong> grails across{' '}
          <strong className="text-white tabular-nums">{sortedCategories.length}</strong> categories
        </span>
        <div className="flex rounded-lg overflow-hidden border border-mibe-border">
          <button
            onClick={() => setView('all')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'all'
                ? 'bg-mibe-gold text-black'
                : 'bg-mibe-card text-mibe-text-2 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setView('category')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'category'
                ? 'bg-mibe-gold text-black'
                : 'bg-mibe-card text-mibe-text-2 hover:text-white'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      {/* All view */}
      {view === 'all' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {allGrails.map((grail) => (
            <GrailCard key={grail.tokenId} grail={grail} showCategory />
          ))}
        </div>
      )}

      {/* By Category view */}
      {view === 'category' && (
        <div className="flex flex-col gap-6">
          {sortedCategories.map(([category, tokens]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-mibe-gold mb-2 uppercase tracking-wider">
                {category} ({tokens.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                {tokens.map((grail) => (
                  <GrailCard key={grail.tokenId} grail={grail} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
