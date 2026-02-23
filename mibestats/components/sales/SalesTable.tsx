'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import { magicEdenUrl } from '@/types'
import type { Sale, PaginatedResponse } from '@/types'

interface Filters {
  token_id:   string
  min_price:  string
  max_price:  string
  from_date:  string
  to_date:    string
  is_grail:   boolean
  page:       number
}

const DEFAULT_FILTERS: Filters = {
  token_id:  '',
  min_price: '',
  max_price: '',
  from_date: '',
  to_date:   '',
  is_grail:  false,
  page:      1,
}

interface Props {
  initialSales: Sale[]
  initialTotal: number
}

function truncateAddr(addr: string | null): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function SalesTable({ initialSales, initialTotal }: Props) {
  const [sales,   setSales]   = useState<Sale[]>(initialSales)
  const [total,   setTotal]   = useState(initialTotal)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  // Draft state for text/number inputs — applied on blur or Enter
  const [draft, setDraft] = useState({ token_id: '', min_price: '', max_price: '' })

  const LIMIT = 50

  const fetchSales = useCallback(async (f: Filters) => {
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(f.page) })
    if (f.token_id)  params.set('token_id',  f.token_id)
    if (f.min_price) params.set('min_price', f.min_price)
    if (f.max_price) params.set('max_price', f.max_price)
    if (f.from_date) params.set('from_date', new Date(f.from_date).toISOString())
    if (f.to_date)   params.set('to_date',   new Date(f.to_date  ).toISOString())
    if (f.is_grail)  params.set('is_grail', 'true')

    try {
      const res = await fetch(`/api/sales?${params.toString()}`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data: PaginatedResponse<Sale> = await res.json()
      setSales(data.data)
      setTotal(data.total)
      setError(null)
    } catch (err) {
      console.error('[SalesTable] fetch error', err)
      setError('Failed to load sales. Please try again.')
    }
  }, [])

  const apply = useCallback((overrides: Partial<Filters>) => {
    const next = { ...filters, ...overrides, page: 1 }
    setFilters(next)
    setLoading(true)
    fetchSales(next).finally(() => setLoading(false))
  }, [filters, fetchSales])

  const changePage = useCallback((p: number) => {
    const next = { ...filters, page: p }
    setFilters(next)
    setLoading(true)
    fetchSales(next).finally(() => setLoading(false))
  }, [filters, fetchSales])

  const applyDraft = useCallback(() => {
    apply({ token_id: draft.token_id, min_price: draft.min_price, max_price: draft.max_price })
  }, [draft, apply])

  const reset = () => {
    setFilters(DEFAULT_FILTERS)
    setDraft({ token_id: '', min_price: '', max_price: '' })
    setSales(initialSales)
    setTotal(initialTotal)
  }

  const totalPages = Math.ceil(total / LIMIT)
  const hasFilters = Object.entries(filters).some(
    ([k, v]) => k !== 'page' && (typeof v === 'boolean' ? v : v !== ''),
  )

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Sales Table
        </h2>
        {hasFilters && (
          <button
            onClick={reset}
            className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {/* Number inputs: update draft on change, apply on blur / Enter */}
        <input
          type="number"
          placeholder="Token ID"
          value={draft.token_id}
          min={1}
          max={10000}
          onChange={(e) => setDraft((d) => ({ ...d, token_id: e.target.value }))}
          onBlur={applyDraft}
          onKeyDown={(e) => e.key === 'Enter' && applyDraft()}
          className="bg-white/5 border border-[var(--border)] rounded px-2 py-1.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20"
        />
        <input
          type="number"
          placeholder="Min price Ƀ"
          value={draft.min_price}
          min={0}
          step={0.01}
          onChange={(e) => setDraft((d) => ({ ...d, min_price: e.target.value }))}
          onBlur={applyDraft}
          onKeyDown={(e) => e.key === 'Enter' && applyDraft()}
          className="bg-white/5 border border-[var(--border)] rounded px-2 py-1.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20"
        />
        <input
          type="number"
          placeholder="Max price Ƀ"
          value={draft.max_price}
          min={0}
          step={0.01}
          onChange={(e) => setDraft((d) => ({ ...d, max_price: e.target.value }))}
          onBlur={applyDraft}
          onKeyDown={(e) => e.key === 'Enter' && applyDraft()}
          className="bg-white/5 border border-[var(--border)] rounded px-2 py-1.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20"
        />
        {/* Date inputs: apply immediately on change */}
        <input
          type="date"
          value={filters.from_date}
          onChange={(e) => apply({ from_date: e.target.value })}
          className="bg-white/5 border border-[var(--border)] rounded px-2 py-1.5 text-white focus:outline-none focus:border-white/20"
        />
        <input
          type="date"
          value={filters.to_date}
          onChange={(e) => apply({ to_date: e.target.value })}
          className="bg-white/5 border border-[var(--border)] rounded px-2 py-1.5 text-white focus:outline-none focus:border-white/20"
        />
        <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5">
          <input
            type="checkbox"
            checked={filters.is_grail}
            onChange={(e) => apply({ is_grail: e.target.checked })}
            className="accent-yellow-400"
          />
          <span className="text-gray-400">Grails</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-[var(--border)]">
              <th className="pb-2 font-medium pr-3">Token</th>
              <th className="pb-2 font-medium pr-3">Date</th>
              <th className="pb-2 font-medium pr-3">Price</th>
              <th className="pb-2 font-medium pr-3">Buyer</th>
              <th className="pb-2 font-medium">TX</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50 pointer-events-none' : ''}>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No sales match these filters.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-white/2 transition-colors"
                >
                  {/* Token */}
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      {sale.token?.imageUrl ? (
                        <Image
                          src={sale.token.imageUrl}
                          alt={`Mibera #${sale.tokenId}`}
                          width={32}
                          height={32}
                          className="rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-white/5 shrink-0" />
                      )}
                      <div>
                        <Link
                          href={magicEdenUrl(sale.tokenId)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white hover:text-yellow-400 transition-colors font-medium"
                        >
                          #{sale.tokenId}
                        </Link>
                        <div className="flex items-center gap-1 mt-0.5">
                          {sale.token?.swagRank && (
                            <SwagRankBadge rank={sale.token.swagRank} size="sm" />
                          )}
                          {sale.token?.isGrail && (
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1 py-0.5 rounded">
                              GRAIL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-2 pr-3 text-gray-400 whitespace-nowrap text-xs">
                    {fmtDate(sale.soldAt)}
                  </td>

                  {/* Price */}
                  <td className="py-2 pr-3 font-semibold text-white whitespace-nowrap">
                    {sale.priceBera.toFixed(2)}{' '}
                    <span className="text-yellow-400">Ƀ</span>
                  </td>

                  {/* Buyer */}
                  <td className="py-2 pr-3 text-gray-400 text-xs font-mono">
                    {truncateAddr(sale.buyerAddress)}
                  </td>

                  {/* TX link */}
                  <td className="py-2">
                    {sale.txHash ? (
                      <a
                        href={`https://berascan.com/tx/${sale.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-500 hover:text-gray-300 text-xs transition-colors font-mono"
                      >
                        {sale.txHash.slice(0, 8)}…
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
          <span>
            {((filters.page - 1) * LIMIT + 1).toLocaleString()}–
            {Math.min(filters.page * LIMIT, total).toLocaleString()} of {total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            {filters.page > 1 && (
              <button
                onClick={() => changePage(filters.page - 1)}
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                ← Prev
              </button>
            )}
            {filters.page < totalPages && (
              <button
                onClick={() => changePage(filters.page + 1)}
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
