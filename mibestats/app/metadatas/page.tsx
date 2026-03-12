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
    <td colSpan={colSpan} className="border border-mibe-border px-2 py-3.5 align-top">
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
  const [modalPhase, setModalPhase] = useState<{ label: string; url: string; description: string } | null>(null)

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
        <p className="chapo-h1">
          Explore individual Mibera metadata
        </p>
      </div>

      {/* Token ID selector */}
      <form onSubmit={handleSubmit} className="card p-3">
        <div className="flex items-center gap-2">
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

      {/* Token display — serpentine + metadata */}
      {token && !loading && (
        <div className="flex flex-col gap-4">
          <h2 className="separator">From MiParcels to Mibera</h2>

          {(() => {
            const CDN = 'https://d163aeqznbc6js.cloudfront.net/images'
            const imgHash = token.imageUrl?.split('/').pop()?.replace('.png', '') ?? ''
            const S3 = 'https://thj-assets.s3.us-west-2.amazonaws.com'
            const IPFS = 'https://bafybeie26hxmg7vdrokv7lxdyrumykj5rkgwabklckdmiyrdsc2hu3crgq.ipfs.dweb.link'
            const phases = [
              { label: 'MiParcels', url: `${S3}/parcels/parcelsImages/${token.tokenId}.png`, description: 'Sealed envelopes — labels, stickers, lore scrawl' },
              { label: 'Miladies', url: `${S3}/fractures/miladies/images/${token.tokenId}.png`, description: 'Milady parody — a counter-statement, not a tribute' },
              { label: 'MiReveal #1.1', url: `${IPFS}/${imgHash}.png`, description: 'Colors and scenery — first hints, rare foregrounds' },
              { label: 'MiReveal #2.2', url: `${CDN}/reveal_phase2/reveal_phase2_images/${imgHash}.png`, description: 'Scene clears, molecule placed, silhouette appears' },
              { label: 'MiReveal #3.3', url: `${CDN}/reveal_phase3/reveal_phase3_images/${imgHash}.png`, description: 'Form takes shape, astrology revealed, eyes closed' },
              { label: 'MiReveal #4.20', url: `${CDN}/reveal_phase4/images/${imgHash}.png`, description: 'Moon appears, hat placed if applicable' },
              { label: 'MiReveal #5.5', url: `${CDN}/reveal_phase5/images/${imgHash}.png`, description: 'Mibera awakens — rising sign, face finalized' },
              { label: 'MiReveal #6.9', url: `${CDN}/reveal_phase6/images/${imgHash}.png`, description: 'Head takes final form, ancient emblem appears' },
              { label: 'MiReveal #7.7', url: `${CDN}/reveal_phase7/images/${imgHash}.png`, description: 'Tattoos added — calm before the storm' },
            ]

            return (
              <table className="w-full border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                  <col style={{ width: '11.11%' }} />
                </colgroup>
                <tbody>
                  {/* Row 1: 9 phase images squeezed in cols 1-4 */}
                  <tr>
                    <td colSpan={4} className="border border-mibe-border" style={{ padding: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {phases.map((phase) => (
                          <div
                            key={phase.label}
                            onClick={() => setModalPhase(phase)}
                            style={{ flex: 1, textAlign: 'center', cursor: 'pointer', minWidth: 0 }}
                          >
                            <div style={{ fontSize: '0.45rem', color: '#1f6feb', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{phase.label}</div>
                            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={phase.url}
                                alt={`${phase.label} #${token.tokenId}`}
                                style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain', borderRadius: '3px' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td colSpan={5} />
                  </tr>
                  {/* Row 2+: NFT image (col 1-4, rowSpan 6) + metadata (col 5-9) */}
                  <tr>
                    <td colSpan={4} rowSpan={6} className="border border-mibe-border p-1.5 align-top">
                      <div className="card-gold p-1 rounded-xl overflow-hidden">
                        {token.imageUrl ? (
                          <Image
                            src={token.imageUrl}
                            alt={`Mibera #${token.tokenId}`}
                            width={400}
                            height={400}
                            className="object-contain rounded-lg w-full h-auto"
                            sizes="44vw"
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
                  <tr>
                    <MetadataCell label="Background" value={token.background} />
                    <MetadataCell label="Birth coordinates" value={token.birthCoordinates} colSpan={2} />
                    <MetadataCell label="Birthday" value={token.birthday} colSpan={2} />
                  </tr>
                  <tr>
                    <MetadataCell label="Body" value={token.body} />
                    <MetadataCell label="Drug" value={token.drug} />
                    <MetadataCell label="Earrings" value={token.earrings} />
                    <MetadataCell label="Element" value={token.element} />
                    <MetadataCell label="Eyebrows" value={token.eyebrows} />
                  </tr>
                  <tr>
                    <MetadataCell label="Eyes" value={token.eyes} />
                    <MetadataCell label="Face accessory" value={token.faceAccessory} />
                    <MetadataCell label="Glasses" value={token.glasses} />
                    <MetadataCell label="Hair" value={token.hair} />
                    <MetadataCell label="Hat" value={token.hat} />
                  </tr>
                  <tr>
                    <MetadataCell label="Item" value={token.item} />
                    <MetadataCell label="Mask" value={token.mask} />
                    <MetadataCell label="Moon sign" value={token.moonSign} />
                    <MetadataCell label="Mouth" value={token.mouth} />
                    <MetadataCell label="Shirt" value={token.shirt} />
                  </tr>
                  <tr>
                    <MetadataCell label="Sun sign" value={token.sunSign} />
                    <MetadataCell label="Swag rank" value={token.swagRank} />
                    <MetadataCell label="Swag score" value={String(token.swagScore)} />
                    <MetadataCell label="Tattoo" value={token.tattoo} />
                    <MetadataCell label="Time period" value={token.timePeriod} />
                  </tr>
                </tbody>
              </table>
            )
          })()}

          {/* Section: Sales */}
          <h2 className="separator">Sales</h2>

          {/* Last Sale + Max Sale */}
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '50%' }} />
              <col style={{ width: '50%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="border border-mibe-border px-2 py-3.5 align-top">
                  <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">Last sale ($BERA)</span>
                  <div className="text-base font-bold text-white tabular-nums">
                    {token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}
                  </div>
                </td>
                <td className="border border-mibe-border px-2 py-3.5 align-top">
                  <span className="text-[9px] text-mibe-gold uppercase tracking-widest font-medium">Max sale ($BERA)</span>
                  <div className="text-base font-bold text-white tabular-nums">
                    {token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Sales History */}
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
      {/* Phase image lightbox — same pattern as FractureTimeline */}
      {modalPhase && (
        <div
          onClick={() => setModalPhase(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: '0.75rem',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={modalPhase.url}
            alt={modalPhase.label}
            style={{ maxWidth: '90vw', maxHeight: '70vh', borderRadius: '0.5rem' }}
          />
          <span className="font-terminal" style={{ color: '#1f6feb', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {modalPhase.label}
          </span>
          <span style={{ color: '#888', fontSize: '0.85rem', maxWidth: '500px', textAlign: 'center' }}>
            {modalPhase.description}
          </span>
        </div>
      )}
    </div>
  )
}
