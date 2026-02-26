'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Token } from '@/types'
import { magicEdenUrl } from '@/types'

interface TokenDetail extends Token {
  magicEdenUrl: string
  salesHistory: Array<{
    id: string
    priceBera: number
    priceUsd: number | null
    soldAt: string
    buyerAddress: string | null
    sellerAddress: string | null
    txHash: string | null
    marketplace: string
  }>
}

const METADATA_FIELDS: Array<{ label: string; key: keyof Token | 'magicEdenUrl'; format?: (v: unknown) => string }> = [
  { label: 'Token ID', key: 'tokenId' },
  { label: 'Archetype', key: 'archetype' },
  { label: 'Ancestor', key: 'ancestor' },
  { label: 'Time Period', key: 'timePeriod' },
  { label: 'Birthday', key: 'birthday' },
  { label: 'Birth Coordinates', key: 'birthCoordinates' },
  { label: 'Element', key: 'element' },
  { label: 'Sun Sign', key: 'sunSign' },
  { label: 'Moon Sign', key: 'moonSign' },
  { label: 'Ascending Sign', key: 'ascendingSign' },
  { label: 'Swag Score', key: 'swagScore' },
  { label: 'Swag Rank', key: 'swagRank' },
  { label: 'Rarity Rank', key: 'rarityRank' },
  { label: 'Background', key: 'background' },
  { label: 'Body', key: 'body' },
  { label: 'Eyes', key: 'eyes' },
  { label: 'Eyebrows', key: 'eyebrows' },
  { label: 'Mouth', key: 'mouth' },
  { label: 'Hair', key: 'hair' },
  { label: 'Shirt', key: 'shirt' },
  { label: 'Hat', key: 'hat' },
  { label: 'Glasses', key: 'glasses' },
  { label: 'Mask', key: 'mask' },
  { label: 'Earrings', key: 'earrings' },
  { label: 'Face Accessory', key: 'faceAccessory' },
  { label: 'Tattoo', key: 'tattoo' },
  { label: 'Item', key: 'item' },
  { label: 'Drug', key: 'drug' },
  { label: 'Is Grail', key: 'isGrail', format: (v) => v ? 'Yes' : 'No' },
  { label: 'Grail Name', key: 'grailName' },
  { label: 'Grail Category', key: 'grailCategory' },
  { label: 'Owner', key: 'ownerAddress' },
  { label: 'Sale Count', key: 'saleCount' },
]

export default function MetadatasPage() {
  const [tokenId, setTokenId] = useState(1)
  const [inputValue, setInputValue] = useState('1')
  const [token, setToken] = useState<TokenDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`/api/tokens/${tokenId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Token not found')
        return res.json()
      })
      .then((data) => {
        setToken(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [tokenId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(inputValue, 10)
    if (num >= 1 && num <= 10000) {
      setTokenId(num)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="section-title text-3xl">MibeMetadatas</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          Explore individual Mibera metadata
        </p>
      </div>

      {/* Token ID selector */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <label htmlFor="token-id" className="text-sm text-mibe-text-2 font-medium">
          Mibera ID:
        </label>
        <input
          id="token-id"
          type="number"
          min={1}
          max={10000}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-28 px-3 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-white text-sm focus:border-mibe-gold focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded-md bg-mibe-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Go
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => { const n = Math.max(1, tokenId - 1); setTokenId(n); setInputValue(String(n)) }}
            className="px-2 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-mibe-text-2 text-sm hover:border-mibe-gold transition-colors"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => { const n = Math.min(10000, tokenId + 1); setTokenId(n); setInputValue(String(n)) }}
            className="px-2 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-mibe-text-2 text-sm hover:border-mibe-gold transition-colors"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={() => { const n = Math.floor(Math.random() * 10000) + 1; setTokenId(n); setInputValue(String(n)) }}
            className="px-3 py-1.5 rounded-md bg-mibe-card border border-mibe-border text-mibe-text-2 text-sm hover:border-mibe-gold transition-colors"
          >
            🎲
          </button>
        </div>
      </form>

      {/* Loading / Error */}
      {loading && (
        <div className="card p-8 flex items-center justify-center">
          <div className="text-mibe-text-2 animate-pulse">Loading Mibera #{tokenId}...</div>
        </div>
      )}

      {error && (
        <div className="card p-4 border-mibe-red text-mibe-red text-sm">
          {error}
        </div>
      )}

      {/* Token display */}
      {token && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Image + quick stats */}
          <div className="flex flex-col gap-4">
            {/* Grail badge if applicable */}
            {token.isGrail && (
              <div className="card-gold p-3 text-center">
                <span className="text-mibe-gold font-bold text-lg">
                  ✦ GRAIL — {token.grailName} ✦
                </span>
              </div>
            )}

            {/* Token image */}
            <div className="card-gold p-2 aspect-square relative overflow-hidden rounded-xl">
              {token.imageUrl ? (
                <Image
                  src={token.imageUrl}
                  alt={`Mibera #${token.tokenId}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-mibe-muted">
                  No image
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card-gold p-3 flex flex-col gap-1">
                <span className="text-xs text-mibe-gold uppercase tracking-widest">Last Sale</span>
                <span className="text-lg font-bold text-white">
                  {token.lastSalePrice != null ? `${token.lastSalePrice.toFixed(2)} BERA` : '—'}
                </span>
              </div>
              <div className="card-gold p-3 flex flex-col gap-1">
                <span className="text-xs text-mibe-gold uppercase tracking-widest">Max Sale</span>
                <span className="text-lg font-bold text-white">
                  {token.maxSalePrice != null ? `${token.maxSalePrice.toFixed(2)} BERA` : '—'}
                </span>
              </div>
            </div>

            {/* MagicEden link */}
            <a
              href={magicEdenUrl(token.tokenId)}
              target="_blank"
              rel="noreferrer"
              className="card px-4 py-2 text-center text-sm text-mibe-cyan hover:text-white hover:border-mibe-cyan transition-colors"
            >
              View on MagicEden ↗
            </a>
          </div>

          {/* Right column: Metadata grid */}
          <div className="lg:col-span-2">
            <h2 className="section-title text-xl mb-4">
              Mibera #{token.tokenId}
              <SwagRankBadge rank={token.swagRank} size="md" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {METADATA_FIELDS.map(({ label, key, format }) => {
                const raw = (token as unknown as Record<string, unknown>)[key]
                const value = format ? format(raw) : raw
                if (value === null || value === undefined) return null

                return (
                  <div key={key} className="card p-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-mibe-gold">
                      {label}
                    </span>
                    <span className="text-sm text-white break-all">
                      {key === 'ownerAddress' ? (
                        <span className="font-mono text-xs">{String(value)}</span>
                      ) : (
                        String(value)
                      )}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Sales history */}
            {token.salesHistory && token.salesHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="section-title text-lg mb-3">Sales History</h3>
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-mibe-border text-xs text-mibe-text-2 uppercase tracking-wider">
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-right">Price (BERA)</th>
                        <th className="p-3 text-left hidden md:table-cell">Buyer</th>
                        <th className="p-3 text-left hidden md:table-cell">Seller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {token.salesHistory.map((sale) => (
                        <tr key={sale.id} className="border-b border-mibe-border/50 hover:bg-mibe-hover/30">
                          <td className="p-3 text-mibe-text-2">
                            {new Date(sale.soldAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right font-medium text-white">
                            {sale.priceBera.toFixed(2)}
                          </td>
                          <td className="p-3 hidden md:table-cell font-mono text-xs text-mibe-text-2 truncate max-w-[120px]">
                            {sale.buyerAddress ? `${sale.buyerAddress.slice(0, 6)}...${sale.buyerAddress.slice(-4)}` : '—'}
                          </td>
                          <td className="p-3 hidden md:table-cell font-mono text-xs text-mibe-text-2 truncate max-w-[120px]">
                            {sale.sellerAddress ? `${sale.sellerAddress.slice(0, 6)}...${sale.sellerAddress.slice(-4)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
