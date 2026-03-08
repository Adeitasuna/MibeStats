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

function MetadataCell({ label, value, colSpan }: { label: string; value: string | null | undefined; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className="border border-mibe-border p-2 align-top">
      <span className="card-title-upper text-[9px]">{label}</span>
      <div className="text-sm text-white truncate" title={value ?? '—'}>{value ?? '—'}</div>
    </td>
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

      {/* Token display — 8-column table layout */}
      {token && !loading && (
        <div className="flex flex-col gap-4">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
            </colgroup>
            <tbody>
              {/* Row 1: MiParcels (col1-2), Miladies (col3), empty (col4), Last Sale (col5-6), Max Sale (col7-8) */}
              <tr>
                <td colSpan={2} rowSpan={2} className="border border-mibe-border p-1 align-top text-center" style={{ height: '100px' }}>
                  <div className="text-[9px] text-mibe-text-2 uppercase tracking-wider mb-1">MiParcels</div>
                  <div className="h-[80px] overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://thj-assets.s3.us-west-2.amazonaws.com/parcels/parcelsImages/${token.tokenId}.png`}
                      alt={`MiParcels #${token.tokenId}`}
                      className="h-full w-auto object-contain rounded rotate-90"
                    />
                  </div>
                </td>
                <td rowSpan={2} className="border border-mibe-border p-1 align-top text-center" style={{ height: '100px' }}>
                  <div className="text-[9px] text-mibe-text-2 uppercase tracking-wider mb-1">Miladies</div>
                  <div className="h-[80px] overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://thj-assets.s3.us-west-2.amazonaws.com/fractures/miladies/images/${token.tokenId}.png`}
                      alt={`Miladies #${token.tokenId}`}
                      className="h-full w-auto object-contain rounded"
                    />
                  </div>
                </td>
                <td className="border border-mibe-border p-2" />
                <td colSpan={2} className="border border-mibe-border p-2 align-top">
                  <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">Last sale ($BERA)</span>
                  <div className="text-base font-bold text-white tabular-nums">
                    {token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}
                  </div>
                </td>
                <td colSpan={2} className="border border-mibe-border p-2 align-top">
                  <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">Max sale ($BERA)</span>
                  <div className="text-base font-bold text-white tabular-nums">
                    {token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}
                  </div>
                </td>
              </tr>
              {/* Row 2: MiParcels/Miladies continue (rowSpan), col4-8 empty */}
              <tr>
                <td colSpan={5} className="border border-mibe-border p-2" />
              </tr>
              {/* Row 3: Image (col1-3, rowSpan 6), metadata cards start */}
              <tr>
                <td colSpan={3} rowSpan={6} className="border border-mibe-border p-1.5 align-top">
                  <div className="card-gold p-1 rounded-xl overflow-hidden">
                    {token.imageUrl ? (
                      <Image
                        src={token.imageUrl}
                        alt={`Mibera #${token.tokenId}`}
                        width={400}
                        height={400}
                        className="object-contain rounded-lg w-full h-auto"
                        sizes="37.5vw"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-mibe-muted">No image</div>
                    )}
                  </div>
                </td>
                <MetadataCell label="ID" value={String(token.tokenId)} />
                <MetadataCell label="Grail" value={token.isGrail ? token.grailName : '—'} />
                <MetadataCell label="Ancestor" value={token.ancestor} />
                <MetadataCell label="Archetype" value={token.archetype} />
                <MetadataCell label="Ascending sign" value={token.ascendingSign} />
              </tr>
              {/* Row 4 */}
              <tr>
                <MetadataCell label="Background" value={token.background} />
                <MetadataCell label="Birth coordinates" value={token.birthCoordinates} colSpan={2} />
                <MetadataCell label="Birthday" value={token.birthday} colSpan={2} />
              </tr>
              {/* Row 5 */}
              <tr>
                <MetadataCell label="Body" value={token.body} />
                <MetadataCell label="Drug" value={token.drug} />
                <MetadataCell label="Earrings" value={token.earrings} />
                <MetadataCell label="Element" value={token.element} />
                <MetadataCell label="Eyebrows" value={token.eyebrows} />
              </tr>
              {/* Row 6 */}
              <tr>
                <MetadataCell label="Eyes" value={token.eyes} />
                <MetadataCell label="Face accessory" value={token.faceAccessory} />
                <MetadataCell label="Glasses" value={token.glasses} />
                <MetadataCell label="Hair" value={token.hair} />
                <MetadataCell label="Hat" value={token.hat} />
              </tr>
              {/* Row 7 */}
              <tr>
                <MetadataCell label="Item" value={token.item} />
                <MetadataCell label="Mask" value={token.mask} />
                <MetadataCell label="Moon sign" value={token.moonSign} />
                <MetadataCell label="Mouth" value={token.mouth} />
                <MetadataCell label="Shirt" value={token.shirt} />
              </tr>
              {/* Row 8 */}
              <tr>
                <MetadataCell label="Sun sign" value={token.sunSign} />
                <MetadataCell label="Swag rank" value={token.swagRank} />
                <MetadataCell label="Swag score" value={String(token.swagScore)} />
                <MetadataCell label="Tattoo" value={token.tattoo} />
                <MetadataCell label="Time period" value={token.timePeriod} />
              </tr>
            </tbody>
          </table>

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
