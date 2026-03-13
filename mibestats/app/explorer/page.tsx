'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import { truncateAddress } from '@/lib/format'
import type { Token } from '@/types'
import { magicEdenUrl } from '@/types'

/** Spinner placeholder that occupies the exact image space */
function ImageSpinner({ size = '100%' }: { size?: string | number }) {
  return (
    <div
      style={{
        width: size,
        aspectRatio: '1 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '3px',
      }}
    >
      <div className="img-spinner" />
    </div>
  )
}

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

function MetadataCell({ label, value, fullWidth }: { label: string; value: string | null | undefined; fullWidth?: boolean }) {
  return (
    <div style={{ padding: '4px', ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
      <div className="stat-card stat-card--gold" style={{ padding: '0.5rem' }}>
        <span className="card-title-upper" style={{ fontSize: '9px' }}>{label}</span>
        <div style={{ fontSize: '1.2rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={value ?? '—'}>{value ?? '—'}</div>
      </div>
    </div>
  )
}

export default function MetadatasPage() {
  const [tokenId, setTokenId] = useState(1)
  const [inputValue, setInputValue] = useState('1')
  const [token, setToken] = useState<TokenDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalPhase, setModalPhase] = useState<{ label: string; url: string; description: string } | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([])
  const phaseHovered = useRef<Set<number>>(new Set())

  const markLoaded = useCallback((key: string) => {
    setLoadedImages((prev) => { const next = new Set(prev); next.add(key); return next })
  }, [])

  const markFailed = useCallback((idx: number) => {
    setFailedImages((prev) => { const next = new Set(prev); next.add(idx); return next })
  }, [])

  // Reset loaded images, failed images and flipped cards when token changes
  useEffect(() => { setLoadedImages(new Set()); setFailedImages(new Set<number>()); setFlippedCards(new Set()) }, [tokenId])

  // Random glitch scheduler for phase images (only non-flipped, non-failed cards)
  const flippedRef = useRef(flippedCards)
  const failedRef = useRef(failedImages)
  useEffect(() => { flippedRef.current = flippedCards }, [flippedCards])
  useEffect(() => { failedRef.current = failedImages }, [failedImages])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let lastGlitchEnd = 0

    function scheduleNext() {
      const delay = 3000 + Math.random() * 7000
      timer = setTimeout(() => {
        const now = Date.now()
        if (now - lastGlitchEnd < 2000) { scheduleNext(); return }

        const candidates: number[] = []
        for (let i = 0; i < 9; i++) {
          if (!phaseHovered.current.has(i) && !flippedRef.current.has(i) && !failedRef.current.has(i) && phaseRefs.current[i]) candidates.push(i)
        }

        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)]
          const el = phaseRefs.current[pick]
          if (el) {
            const duration = 500 + Math.random() * 500
            el.classList.add('glitching')
            setTimeout(() => el.classList.remove('glitching'), duration)
            lastGlitchEnd = now + duration
          }
        }
        scheduleNext()
      }, delay)
    }

    const initialDelay = 2000 + Math.random() * 3000
    timer = setTimeout(scheduleNext, initialDelay)
    return () => clearTimeout(timer)
  }, [token])

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
        <h1 className="section-title text-3xl"><span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Collection &gt; </span>Explorer</h1>
        <p className="chapo-h1">
          Explore individual Mibera metadata
        </p>
      </div>

      {/* Token ID selector */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="token-id" className="text-xs text-mibe-gold font-semibold uppercase tracking-wider" style={{ marginRight: '0.25rem', lineHeight: 1 }}>
            Mibera ID
          </label>
          <input
            id="token-id"
            type="number"
            min={1}
            max={10000}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-24 rounded-lg bg-mibe-bg border border-mibe-border text-white text-sm focus:border-mibe-gold focus:outline-none tabular-nums"
            style={{ padding: '0.4rem 0.6rem', lineHeight: 1.2 }}
          />
          <button
            type="submit"
            className="rounded-lg text-xs font-semibold btn-go"
            style={{ padding: '0.4rem 0.85rem', lineHeight: 1.2, background: 'rgb(255, 215, 0)', color: '#000', border: '1px solid rgb(184, 156, 50)' }}
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
          <div className="separator" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit' }}>From MiParcels to Mibera</h2>
            <button
              type="button"
              className="btn-go"
              onClick={() => setFlippedCards(new Set(Array.from({ length: 9 }, (_, i) => i).filter(i => !failedImages.has(i))))}
              style={{ padding: '0.4rem 0.85rem', lineHeight: 1.2, borderRadius: '0.5rem', background: 'rgb(255, 215, 0)', color: '#000', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgb(184, 156, 50)', cursor: 'pointer', flexShrink: 0 }}
            >
              Reveal all
            </button>
          </div>

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
              <div className="flex flex-col gap-4">
                {/* Hidden preload — ensures onLoad fires even with backface-visibility */}
                <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                  {phases.map((phase, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={phase.label} src={phase.url} alt="" onLoad={() => markLoaded(phase.label)} onError={() => markFailed(idx)} />
                  ))}
                </div>
                {/* Row 1: 9 phase images — full width */}
                <div style={{ padding: '6px', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {phases.map((phase, idx) => {
                      const isFlipped = flippedCards.has(idx)
                      const isFailed = failedImages.has(idx)

                      // Failed phase — static card, no flip, no effects
                      if (isFailed) {
                        return (
                          <div
                            key={phase.label}
                            style={{ flex: 1, textAlign: 'center', minWidth: 0, borderRadius: '3px' }}
                          >
                            <div style={{ width: '100%', aspectRatio: '3 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)', borderRadius: '3px', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative' }}>
                              <div style={{ position: 'absolute', top: '4px', left: 0, right: 0, fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>{phase.label}</div>
                              <span style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.15)', userSelect: 'none', textTransform: 'uppercase' }}>N/A</span>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={phase.label}
                          ref={(el) => { phaseRefs.current[idx] = el }}
                          className={`phase-card-flip${isFlipped ? ' flipped' : ''} fugitive-card`}
                          onClick={() => {
                            if (!isFlipped) {
                              setFlippedCards((prev) => { const next = new Set(prev); next.add(idx); return next })
                              const el = phaseRefs.current[idx]
                              if (el) el.classList.remove('glitching')
                            } else {
                              setModalPhase(phase)
                            }
                          }}
                          onMouseEnter={() => {
                            if (!isFlipped) {
                              phaseHovered.current.add(idx)
                              const el = phaseRefs.current[idx]
                              if (el) {
                                el.classList.add('glitching')
                                setTimeout(() => el.classList.remove('glitching'), 500 + Math.random() * 1000)
                              }
                            }
                          }}
                          onMouseLeave={() => {
                            phaseHovered.current.delete(idx)
                            if (!isFlipped) {
                              const el = phaseRefs.current[idx]
                              if (el) el.classList.remove('glitching')
                            }
                          }}
                          style={{ flex: 1, textAlign: 'center', cursor: 'pointer', minWidth: 0, borderRadius: '3px' }}
                        >
                          <div className="phase-card-inner">
                            {/* FRONT — hidden card back */}
                            <div className="phase-card-front">
                              <div style={{ width: '100%', aspectRatio: '3 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1510 50%, #0a0a0a 100%)', borderRadius: '3px', border: '1px solid rgba(255, 215, 0, 0.3)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '4px', left: 0, right: 0, fontSize: '0.6rem', color: 'rgb(255, 236, 179)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>{phase.label}</div>
                                <span style={{ fontSize: '1.5rem', color: 'rgba(255, 215, 0, 0.25)', userSelect: 'none' }}>?</span>
                              </div>
                            </div>
                            {/* BACK — revealed image */}
                            <div className="phase-card-back">
                              <div style={{ width: '100%', aspectRatio: '3 / 4', position: 'relative', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, fontSize: '0.6rem', color: '#000', background: 'rgba(255, 236, 179, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px 4px', zIndex: 2 }}>{phase.label}</div>
                                {!loadedImages.has(phase.label) && (
                                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="img-spinner" />
                                  </div>
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={phase.url}
                                  alt={`${phase.label} #${token.tokenId}`}
                                  style={{
                                    width: '100%', height: '100%', objectFit: 'cover', borderRadius: '3px',
                                    opacity: loadedImages.has(phase.label) ? 1 : 0,
                                    transition: 'opacity 0.3s ease',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', marginTop: '1rem', marginBottom: '1rem' }} />
                </div>

                {/* Row 2: NFT image (left, auto-sized) + metadata grid (right) */}
                <div className="meta-layout">
                  {/* Main image — height driven by data grid, width = height (square) */}
                  <div className="meta-image-col">
                    {/* Spinner — always visible until image loads */}
                    {token.imageUrl && !loadedImages.has('main') && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <div className="img-spinner" style={{ width: 40, height: 40 }} />
                      </div>
                    )}
                    {/* Grail badge */}
                    {token.isGrail && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', zIndex: 2 }}>
                        <div style={{ background: 'rgba(255, 215, 0, 0.9)', color: '#000', fontSize: '14px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em' }}>GRAIL</div>
                        {token.grailName && (
                          <div style={{ background: 'rgba(0, 0, 0, 0.75)', color: 'rgb(255, 236, 179)', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255, 215, 0, 0.4)' }}>{token.grailName}</div>
                        )}
                      </div>
                    )}
                    {token.imageUrl ? (
                      <Image
                        src={token.imageUrl}
                        alt={`Mibera #${token.tokenId}`}
                        width={500}
                        height={500}
                        className="rounded-lg"
                        style={{
                          width: '100%', height: '100%', objectFit: 'contain',
                          opacity: loadedImages.has('main') ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }}
                        sizes="35vw"
                        onLoad={() => markLoaded('main')}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No image</div>
                    )}
                  </div>

                  {/* Metadata grid — responsive columns */}
                  <div className="meta-data-col">
                    <div className="meta-grid">
                      <MetadataCell label="ID" value={String(token.tokenId)} />
                      <MetadataCell label="Swag rank" value={token.swagRank} />
                      <MetadataCell label="Swag score" value={String(token.swagScore)} />
                      <MetadataCell label="Archetype" value={token.archetype} />
                      <MetadataCell label="Ancestor" value={token.ancestor} />
                      <MetadataCell label="Element" value={token.element} />
                      <MetadataCell label="Grail" value={token.isGrail ? token.grailName : '—'} />
                      <MetadataCell label="Time period" value={token.timePeriod} />
                      <MetadataCell label="Drug" value={token.drug} />
                      <MetadataCell label="Sun sign" value={token.sunSign} />
                      <MetadataCell label="Moon sign" value={token.moonSign} />
                      <MetadataCell label="Ascending sign" value={token.ascendingSign} />
                      <MetadataCell label="Background" value={token.background} />
                      <MetadataCell label="Body" value={token.body} />
                      <MetadataCell label="Eyes" value={token.eyes} />
                      <MetadataCell label="Eyebrows" value={token.eyebrows} />
                      <MetadataCell label="Mouth" value={token.mouth} />
                      <MetadataCell label="Hair" value={token.hair} />
                      <MetadataCell label="Hat" value={token.hat} />
                      <MetadataCell label="Glasses" value={token.glasses} />
                      <MetadataCell label="Shirt" value={token.shirt} />
                      <MetadataCell label="Mask" value={token.mask} />
                      <MetadataCell label="Earrings" value={token.earrings} />
                      <MetadataCell label="Face accessory" value={token.faceAccessory} />
                      <MetadataCell label="Item" value={token.item} />
                      <MetadataCell label="Tattoo" value={token.tattoo} />
                      <MetadataCell label="Birthday" value={token.birthday} />
                      <MetadataCell label="Birth coordinates" value={token.birthCoordinates} fullWidth />
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Section: Sales */}
          <h2 className="separator">Sales</h2>

          {/* Row 1: 4 columns — Last Sale, Max Sale, Transfers, Sales */}
          {(() => {
            const hasSales = token.salesHistory && token.salesHistory.length > 0
            return (
              <>
                <table className="w-full border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      {hasSales ? (
                        <>
                          <td className="p-1 align-top">
                            <div className="stat-card stat-card--gold px-2 py-3">
                              <span className="card-title-upper text-[9px]">Last sale ($BERA)</span>
                              <div className="text-base font-bold text-white tabular-nums">
                                {token.lastSalePrice != null ? token.lastSalePrice.toFixed(2) : '—'}
                              </div>
                            </div>
                          </td>
                          <td className="p-1 align-top">
                            <div className="stat-card stat-card--gold px-2 py-3">
                              <span className="card-title-upper text-[9px]">Max sale ($BERA)</span>
                              <div className="text-base font-bold text-white tabular-nums">
                                {token.maxSalePrice != null ? token.maxSalePrice.toFixed(2) : '—'}
                              </div>
                            </div>
                          </td>
                        </>
                      ) : (
                        <td colSpan={2} className="p-1 align-top">
                          <div className="stat-card px-3 py-3" style={{ borderColor: 'rgba(0, 191, 255, 0.3)', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: 700, color: '#00bfff', textTransform: 'uppercase' }}>
                              ◆ Diamond Hands ◆
                            </span>
                            <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Never sold
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="p-1 align-top">
                        <div className="stat-card stat-card--gold px-2 py-3">
                          <span className="card-title-upper text-[9px]">Transfers</span>
                          <div className="text-base font-bold text-white tabular-nums">
                            {token.transferCount ?? 0}
                          </div>
                        </div>
                      </td>
                      <td className="p-1 align-top">
                        <div className="stat-card stat-card--gold px-2 py-3">
                          <span className="card-title-upper text-[9px]">Real sales</span>
                          <div className="text-base font-bold text-white tabular-nums">
                            {token.salesHistory?.length ?? 0}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Row 2: Sales History table */}
                {hasSales && (
                  <div className="stat-card stat-card--gold overflow-hidden" style={{ marginTop: '1.5rem' }}>
                    <div className="table-responsive">
                      <table className="w-full text-sm table-fixed">
                        <colgroup>
                          <col style={{ width: '10%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '26%' }} />
                          <col style={{ width: '26%' }} />
                          <col style={{ width: '26%' }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-mibe-border font-semibold" style={{ letterSpacing: '0.05em', fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                            <th className="px-4 py-3" style={{ textAlign: 'right' }}>Date</th>
                            <th className="px-4 py-3" style={{ textAlign: 'right' }}>Price (BERA)</th>
                            <th className="px-4 py-3" style={{ textAlign: 'right' }}>Buyer</th>
                            <th className="px-4 py-3" style={{ textAlign: 'right' }}>Seller</th>
                            <th className="px-4 py-3" style={{ textAlign: 'right' }}>Tx</th>
                          </tr>
                        </thead>
                        <tbody>
                          {token.salesHistory.map((sale) => (
                            <tr key={sale.id} className="border-b border-mibe-border/50 hover:bg-mibe-hover/30">
                              <td className="px-4 py-3 text-mibe-text-2 text-xs" style={{ textAlign: 'right' }}>
                                {new Date(sale.soldAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 font-medium text-white tabular-nums" style={{ textAlign: 'right' }}>
                                {sale.priceBera.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-mibe-text-2" style={{ textAlign: 'right' }}>
                                {sale.buyerAddress ? (
                                  <span className="flex items-center justify-end" style={{ gap: '1rem' }}>
                                    <span title={sale.buyerAddress}>{truncateAddress(sale.buyerAddress)}</span>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(sale.buyerAddress!)}
                                      className="flex-shrink-0 text-mibe-text-2 hover:text-mibe-gold transition-colors flex items-center"
                                      title="Copy address"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    </button>
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-mibe-text-2" style={{ textAlign: 'right' }}>
                                {sale.sellerAddress ? (
                                  <span className="flex items-center justify-end" style={{ gap: '1rem' }}>
                                    <span title={sale.sellerAddress}>{truncateAddress(sale.sellerAddress)}</span>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(sale.sellerAddress!)}
                                      className="flex-shrink-0 text-mibe-text-2 hover:text-mibe-gold transition-colors flex items-center"
                                      title="Copy address"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    </button>
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-mibe-text-2" style={{ textAlign: 'right' }}>
                                {sale.txHash ? (
                                  <span className="flex items-center justify-end" style={{ gap: '1rem' }}>
                                    <a
                                      href={`https://berascan.com/tx/${sale.txHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-mibe-blue hover:underline"
                                      title={sale.txHash}
                                    >
                                      {sale.txHash.slice(0, 8)}...{sale.txHash.slice(-6)}
                                    </a>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(sale.txHash!)}
                                      className="flex-shrink-0 text-mibe-text-2 hover:text-mibe-gold transition-colors flex items-center"
                                      title="Copy tx hash"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    </button>
                                  </span>
                                ) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
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
