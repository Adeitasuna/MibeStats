'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import { truncateAddress } from '@/lib/format'
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

interface FieldDef {
  label: string
  key: keyof Token | 'magicEdenUrl'
  format?: (v: unknown) => string
}

const IDENTITY_FIELDS: FieldDef[] = [
  { label: 'Token ID', key: 'tokenId' },
  { label: 'Archetype', key: 'archetype' },
  { label: 'Ancestor', key: 'ancestor' },
  { label: 'Time Period', key: 'timePeriod' },
  { label: 'Birthday', key: 'birthday' },
  { label: 'Birth Coordinates', key: 'birthCoordinates' },
]

const ASTROLOGY_FIELDS: FieldDef[] = [
  { label: 'Element', key: 'element' },
  { label: 'Sun Sign', key: 'sunSign' },
  { label: 'Moon Sign', key: 'moonSign' },
  { label: 'Ascending Sign', key: 'ascendingSign' },
]

const RANKING_FIELDS: FieldDef[] = [
  { label: 'Swag Score', key: 'swagScore' },
  { label: 'Swag Rank', key: 'swagRank' },
  { label: 'Rarity Rank', key: 'rarityRank' },
  { label: 'Sale Count', key: 'saleCount' },
]

const APPEARANCE_FIELDS: FieldDef[] = [
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
]

const GRAIL_FIELDS: FieldDef[] = [
  { label: 'Is Grail', key: 'isGrail', format: (v) => v ? 'Yes' : 'No' },
  { label: 'Grail Name', key: 'grailName' },
  { label: 'Grail Category', key: 'grailCategory' },
]

const FIELD_GROUPS = [
  { title: 'Identity', fields: IDENTITY_FIELDS },
  { title: 'Astrology', fields: ASTROLOGY_FIELDS },
  { title: 'Ranking', fields: RANKING_FIELDS },
  { title: 'Appearance', fields: APPEARANCE_FIELDS },
  { title: 'Grail', fields: GRAIL_FIELDS },
]

function MetadataCard({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="card p-2.5 flex flex-col gap-0.5">
      <span className="card-title-upper">
        {label}
      </span>
      <span className={`text-sm text-white ${isMono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}

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

  const goTo = (n: number) => {
    setTokenId(n)
    setInputValue(String(n))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="section-title text-3xl">MibeMetadatas</h1>
        <p className="chapo-h1">
          Explore individual Mibera metadata
        </p>
      </div>

      {/* Token ID selector */}
      <form onSubmit={handleSubmit} className="card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="token-id" className="text-xs text-mibe-gold font-semibold uppercase tracking-wider">
            Mibera ID
          </label>
          <input
            id="token-id"
            type="number"
            min={1}
            max={10000}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-24 px-2.5 py-1.5 rounded-lg bg-mibe-bg border border-mibe-border text-white text-sm focus:border-mibe-gold focus:outline-none tabular-nums"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-mibe-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
          >
            Go
          </button>
          <div className="flex gap-1 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => goTo(Math.max(1, tokenId - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors"
              aria-label="Previous Mibera"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.min(10000, tokenId + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors"
              aria-label="Next Mibera"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.floor(Math.random() * 10000) + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-mibe-card border border-mibe-border text-mibe-text-2 hover:text-white hover:border-mibe-gold transition-colors"
              aria-label="Random Mibera"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="card p-8 flex flex-col items-center justify-center gap-3">
          <Image
            src="/waiting.gif"
            alt="Loading..."
            width={120}
            height={120}
            unoptimized
          />
          <span className="text-mibe-text-2 text-sm">Loading Mibera #{tokenId}...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-4 border-mibe-red text-mibe-red text-sm">
          {error}
        </div>
      )}

      {/* Token display */}
      {token && !loading && (
        <div className="flex flex-col gap-4">
          {/* Top row: small thumbnail + sale cards */}
          <div className="flex items-start gap-3">
            {token.imageUrl && (
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-mibe-border">
                <Image
                  src={token.imageUrl}
                  alt={`Mibera #${token.tokenId}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="section-title text-lg">Mibera #{token.tokenId}</h2>
                <SwagRankBadge rank={token.swagRank} size="md" />
                {token.isGrail && (
                  <span className="text-mibe-gold font-bold text-xs">GRAIL — {token.grailName}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <a href={magicEdenUrl(token.tokenId)} target="_blank" rel="noreferrer" className="text-mibe-cyan hover:text-white transition-colors">MagicEden</a>
                {token.ownerAddress && (
                  <span className="font-mono text-[10px] text-mibe-text-2" title={token.ownerAddress}>Owner: {truncateAddress(token.ownerAddress)}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="card-gold px-3 py-2 flex flex-col gap-0.5">
                <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">Last Sale ($BERA)</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {token.lastSalePrice != null ? `${token.lastSalePrice.toFixed(2)}` : '—'}
                </span>
              </div>
              <div className="card-gold px-3 py-2 flex flex-col gap-0.5">
                <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">Max Sale ($BERA)</span>
                <span className="text-base font-bold text-white tabular-nums">
                  {token.maxSalePrice != null ? `${token.maxSalePrice.toFixed(2)}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Main content: image left (3/8) + cards right (5/8) */}
          <div className="flex flex-col md:flex-row gap-3 items-start">
            {/* Image */}
            <div className="w-full md:w-[37.5%] shrink-0">
              <div className="card-gold p-1.5 overflow-hidden rounded-xl sticky top-4">
                {token.imageUrl ? (
                  <Image
                    src={token.imageUrl}
                    alt={`Mibera #${token.tokenId}`}
                    width={400}
                    height={400}
                    className="object-contain rounded-lg w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 37.5vw"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-mibe-muted">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Metadata cards */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {FIELD_GROUPS.flatMap((group) =>
                  group.fields
                    .filter(({ key, format }) => {
                      const raw = (token as unknown as Record<string, unknown>)[key]
                      const value = format ? format(raw) : raw
                      return value !== null && value !== undefined
                    })
                    .map(({ label, key, format }) => {
                      const raw = (token as unknown as Record<string, unknown>)[key]
                      const value = format ? format(raw) : String(raw)
                      return (
                        <MetadataCard key={key} label={label} value={String(value)} />
                      )
                    })
                )}
              </div>
            </div>
          </div>

          {/* Sales history - full width below */}
          {token.salesHistory && token.salesHistory.length > 0 && (
            <div>
              <h3 className="card-title-upper mb-2">
                Sales History ({token.salesHistory.length})
              </h3>
              <div className="card overflow-hidden">
                <div className="table-responsive">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-mibe-border text-[10px] text-mibe-text-2 uppercase tracking-wider">
                        <th className="p-2.5 text-left">Date</th>
                        <th className="p-2.5 text-right">Price (BERA)</th>
                        <th className="p-2.5 text-left">Buyer</th>
                        <th className="p-2.5 text-left">Seller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {token.salesHistory.map((sale) => (
                        <tr key={sale.id} className="border-b border-mibe-border/50 hover:bg-mibe-hover/30">
                          <td className="p-2.5 text-mibe-text-2 text-xs">
                            {new Date(sale.soldAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5 text-right font-medium text-white tabular-nums">
                            {sale.priceBera.toFixed(2)}
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-mibe-text-2">
                            {sale.buyerAddress ? truncateAddress(sale.buyerAddress) : '—'}
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-mibe-text-2">
                            {sale.sellerAddress ? truncateAddress(sale.sellerAddress) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
