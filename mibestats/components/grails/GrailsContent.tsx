'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { Token } from '@/types'
import { magicEdenUrl } from '@/types'
import { StatusNote } from '@/components/dev/StatusNote'

interface GrailToken extends Token {
  magicEdenUrl: string
}

interface GrailsResponse {
  total: number
  categories: Record<string, GrailToken[]>
}

function GrailCard({
  grail,
  idx,
  onImageClick,
  registerHandle,
}: {
  grail: GrailToken
  idx: number
  onImageClick: (grail: GrailToken) => void
  registerHandle: (idx: number, handle: { isHovered: boolean; triggerGlitch: (ms: number) => void }) => void
}) {
  const maxPrice = grail.maxSalePrice != null ? Number(grail.maxSalePrice).toLocaleString(undefined, { maximumFractionDigits: 1 }) : ''
  const lastPrice = grail.lastSalePrice != null ? Number(grail.lastSalePrice).toLocaleString(undefined, { maximumFractionDigits: 1 }) : ''
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const [imgLoaded, setImgLoaded] = useState(false)

  const triggerGlitch = useCallback((durationMs: number) => {
    const el = ref.current
    if (!el) return
    el.classList.add('glitching')
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => el.classList.remove('glitching'), durationMs)
  }, [])

  useEffect(() => {
    registerHandle(idx, { isHovered: false, triggerGlitch })
  }, [idx, registerHandle, triggerGlitch])

  const onMouseEnter = useCallback(() => {
    registerHandle(idx, { isHovered: true, triggerGlitch })
    triggerGlitch(500 + Math.random() * 1000)
  }, [idx, registerHandle, triggerGlitch])

  const onMouseLeave = useCallback(() => {
    registerHandle(idx, { isHovered: false, triggerGlitch })
    const el = ref.current
    if (el) el.classList.remove('glitching')
    clearTimeout(timeoutRef.current)
  }, [idx, registerHandle, triggerGlitch])

  return (
    <div
      ref={ref}
      className="fugitive-card overflow-hidden group hover:shadow-lg hover:shadow-yellow-900/20 transition-all"
      style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgb(255, 236, 179)', borderRadius: '0.5rem', background: '#111' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Grail name */}
      <div style={{ padding: '0.4rem 0.5rem 0.2rem', textAlign: 'center' }}>
        <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(255, 236, 179)' }}>
          {grail.grailName ?? `#${grail.tokenId}`}
        </span>
      </div>

      {/* Image — miniature with spinner, clickable for modal */}
      <div
        onClick={() => onImageClick(grail)}
        style={{ position: 'relative', aspectRatio: '3 / 4', overflow: 'hidden', cursor: 'pointer', borderTop: '1px solid rgb(255, 236, 179)', borderBottom: '1px solid rgb(255, 236, 179)' }}
      >
        {grail.imageUrl ? (
          <>
            {!imgLoaded && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div className="img-spinner" />
              </div>
            )}
            <Image
              src={grail.imageUrl}
              alt={grail.grailName ?? `Mibera #${grail.tokenId}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ borderRadius: 0, opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
              sizes="14vw"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-mibe-hover text-mibe-muted">
            ?
          </div>
        )}
      </div>

      {/* Prices or Diamond Hands */}
      {maxPrice || lastPrice ? (
        <div style={{ padding: '0.35rem 0.5rem 0.5rem', fontSize: '0.7rem', lineHeight: 1.5, color: 'rgb(255, 236, 179)' }}>
          <div>Max : {maxPrice ? `${maxPrice} $BERA` : '—'}</div>
          <div>Last : {lastPrice ? `${lastPrice} $BERA` : '—'}</div>
        </div>
      ) : (
        <div style={{ padding: '0.35rem 0.5rem 0.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00bfff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ◆ Diamond ◆
          </span>
        </div>
      )}
    </div>
  )
}

/** Skeleton card shown while API data loads */
function GrailCardSkeleton() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 236, 179, 0.3)', borderRadius: '0.5rem', background: '#111' }}
    >
      <div style={{ padding: '0.4rem 0.5rem 0.2rem', textAlign: 'center' }}>
        <div style={{ height: '0.65rem', width: '60%', margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }} />
      </div>
      <div style={{ aspectRatio: '3 / 4', borderTop: '1px solid rgba(255, 236, 179, 0.3)', borderBottom: '1px solid rgba(255, 236, 179, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' }}>
        <div className="img-spinner" />
      </div>
      <div style={{ padding: '0.35rem 0.5rem 0.5rem' }}>
        <div style={{ height: '0.6rem', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '4px' }} />
        <div style={{ height: '0.6rem', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }} />
      </div>
    </div>
  )
}

export function GrailsContent() {
  const [data, setData] = useState<GrailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalGrail, setModalGrail] = useState<GrailToken | null>(null)
  const handlesRef = useRef<Map<number, { isHovered: boolean; triggerGlitch: (ms: number) => void }>>(new Map())

  const registerHandle = useCallback((idx: number, handle: { isHovered: boolean; triggerGlitch: (ms: number) => void }) => {
    handlesRef.current.set(idx, handle)
  }, [])

  // Random glitch scheduler
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let lastGlitchEnd = 0

    function scheduleNext() {
      const delay = 3000 + Math.random() * 7000
      timer = setTimeout(() => {
        const now = Date.now()
        if (now - lastGlitchEnd < 2000) { scheduleNext(); return }

        const candidates: number[] = []
        handlesRef.current.forEach((handle, idx) => {
          if (!handle.isHovered) candidates.push(idx)
        })

        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)]
          const handle = handlesRef.current.get(pick)
          if (handle) {
            const duration = 500 + Math.random() * 500
            handle.triggerGlitch(duration)
            lastGlitchEnd = now + duration
          }
        }
        scheduleNext()
      }, delay)
    }

    const initialDelay = 2000 + Math.random() * 3000
    timer = setTimeout(scheduleNext, initialDelay)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/grails', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch((err) => {
        if (err.name !== 'AbortError') { setError('Failed to load grails data.'); setLoading(false) }
      })
    return () => controller.abort()
  }, [])

  if (error && !data) {
    return (
      <div className="card p-8 text-center text-mibe-text-2">
        {error}
      </div>
    )
  }

  const sortedCategories = data
    ? Object.entries(data.categories).sort(([a], [b]) => a.localeCompare(b))
    : []
  const allGrails = sortedCategories
    .flatMap(([, tokens]) => tokens)
    .sort((a, b) => (a.grailName ?? '').localeCompare(b.grailName ?? ''))

  return (
    <div className="flex flex-col gap-4">
      {/* Grid */}
      <div className="grails-grid">
        {loading
          ? Array.from({ length: 42 }).map((_, i) => <GrailCardSkeleton key={i} />)
          : allGrails.map((grail, idx) => (
              <GrailCard key={grail.tokenId} grail={grail} idx={idx} onImageClick={setModalGrail} registerHandle={registerHandle} />
            ))
        }
      </div>

      {/* Lightbox modal */}
      {modalGrail && (
        <div
          onClick={() => setModalGrail(null)}
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
          {modalGrail.imageUrl && (
            <img
              src={modalGrail.imageUrl}
              alt={modalGrail.grailName ?? `Mibera #${modalGrail.tokenId}`}
              style={{ maxWidth: '90vw', maxHeight: '70vh', borderRadius: '0.5rem', objectFit: 'contain' }}
            />
          )}
          <span className="font-terminal" style={{ color: 'var(--accent-gold)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {modalGrail.grailName ?? `#${modalGrail.tokenId}`}
          </span>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>
            {modalGrail.grailCategory}
          </span>
          <a
            href={magicEdenUrl(modalGrail.tokenId)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: '#1f6feb', fontSize: '0.8rem', textDecoration: 'underline' }}
          >
            View on Magic Eden
          </a>
          {modalGrail.grailName?.toLowerCase() === 'black hole' && (
            <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '0.25rem' }}>
              <StatusNote t="c" style={{ fontSize: '0.8rem', color: '#ffd700', fontFamily: 'var(--font-share-tech-mono), monospace' }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
