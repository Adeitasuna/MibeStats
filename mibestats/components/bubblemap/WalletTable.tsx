'use client'

import type { BubbleMapNode } from '@/types'
import { TIER_COLORS } from '@/lib/chart-constants'
import { DEFAULT_PAGE_SIZE } from './bubblemap-constants'

interface WalletTableProps {
  sortedWallets: BubbleMapNode[]
  page: number
  setPage: (updater: (prev: number) => number) => void
  focusedAddr: string | null
  onRowClick: (address: string) => void
}

export function WalletTable({ sortedWallets, page, setPage, focusedAddr, onRowClick }: WalletTableProps) {
  const totalPages = Math.ceil(sortedWallets.length / DEFAULT_PAGE_SIZE)
  const pagedWallets = sortedWallets.slice(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE)

  return (
    <div className="col-start-1 col-end-4 row-start-2 row-end-4 flex flex-col gap-1">
      <span className="card-title-upper">
        Wallets by NFT Count
      </span>
      <div className="bg-[var(--bg-card)] border border-white/10 rounded overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-y-auto flex-1 min-h-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[0.5625rem] uppercase tracking-wide text-mibe-text-2">
                <th className="py-1.5 px-2 text-left w-[30px]">#</th>
                <th className="py-1.5 px-2 text-left">Address</th>
                <th className="py-1.5 px-2 text-right w-[50px]">NFTs</th>
                <th className="py-1.5 px-2 text-right w-[70px]">Tier</th>
              </tr>
            </thead>
            <tbody>
              {pagedWallets.map((w, i) => (
                <tr
                  key={w.id}
                  onClick={() => onRowClick(w.id)}
                  className={`cursor-pointer border-b border-white/5 hover:bg-white/10 ${
                    focusedAddr === w.id ? 'bg-mibe-gold/[0.12]' : ''
                  }`}
                >
                  <td className="py-1 px-2 text-mibe-muted">{page * DEFAULT_PAGE_SIZE + i + 1}</td>
                  <td className="py-1 px-2 font-mono text-[0.6875rem] text-[#ccc] break-all">{w.id}</td>
                  <td className="py-1 px-2 text-right font-bold text-white">{w.count}</td>
                  <td className="py-1 px-2 text-right capitalize" style={{ color: TIER_COLORS[w.tier] }}>{w.tier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-white/10 shrink-0 text-[0.5625rem] text-mibe-text-2">
            <span>{sortedWallets.length} wallets</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              <span>{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
