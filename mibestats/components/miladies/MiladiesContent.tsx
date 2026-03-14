'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'

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

function MiladyCard({
  token,
  idx,
  registerHandle,
}: {
  token: MiladyToken
  idx: number
  registerHandle: (idx: number, handle: { isHovered: boolean; triggerGlitch: (ms: number) => void }) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const [miladyLoaded, setMiladyLoaded] = useState(false)
  const [miberaLoaded, setMiberaLoaded] = useState(false)

  const flipped = hovered || tapped

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

  const maxPrice = token.maxSalePrice != null ? Number(token.maxSalePrice).toLocaleString(undefined, { maximumFractionDigits: 1 }) : ''
  const lastPrice = token.lastSalePrice != null ? Number(token.lastSalePrice).toLocaleString(undefined, { maximumFractionDigits: 1 }) : ''

  // Tap outside to close on mobile
  useEffect(() => {
    if (!tapped) return
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setTapped(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [tapped])

  return (
    <div
      ref={ref}
      className="fugitive-card overflow-hidden group transition-all"
      style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgb(255, 236, 179)', borderRadius: '0.5rem', background: '#111', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setTapped((t) => !t)}
    >
      {/* Token ID */}
      <div style={{ padding: '0.4rem 0.5rem 0.2rem', textAlign: 'center' }}>
        <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(255, 236, 179)' }}>
          #{token.tokenId}
        </span>
      </div>

      {/* Image — milady by default, mibera on hover */}
      <div style={{ position: 'relative', aspectRatio: '3 / 4', overflow: 'hidden', borderTop: '1px solid rgb(255, 236, 179)', borderBottom: '1px solid rgb(255, 236, 179)' }}>
        {/* Spinner */}
        {!miladyLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', zIndex: 1 }}>
            <div className="img-spinner" />
          </div>
        )}

        {/* Milady image (default) */}
        <Image
          src={token.miladyImageUrl}
          alt={`Milady #${token.tokenId}`}
          fill
          className="object-cover transition-opacity duration-300"
          style={{ borderRadius: 0, opacity: miladyLoaded && !flipped ? 1 : 0 }}
          sizes="14vw"
          unoptimized
          onLoad={() => setMiladyLoaded(true)}
        />

        {/* Mibera image (on hover) */}
        {token.miberaImageUrl && (
          <Image
            src={token.miberaImageUrl}
            alt={`Mibera #${token.tokenId}`}
            fill
            className="object-cover transition-opacity duration-300"
            style={{ borderRadius: 0, opacity: flipped && miberaLoaded ? 1 : 0 }}
            sizes="14vw"
            onLoad={() => setMiberaLoaded(true)}
          />
        )}

        {/* Grail badge */}
        {token.isGrail && (
          <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,215,0,0.9)', color: '#000', fontSize: '8px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px', zIndex: 2 }}>
            GRAIL
          </div>
        )}
      </div>

      {/* Prices or Diamond */}
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

/** Skeleton card */
function MiladyCardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 236, 179, 0.3)', borderRadius: '0.5rem', background: '#111' }}>
      <div style={{ padding: '0.4rem 0.5rem 0.2rem', textAlign: 'center' }}>
        <div style={{ height: '0.65rem', width: '40%', margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }} />
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

export function MiladiesContent() {
  const [tokens, setTokens] = useState<MiladyToken[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const handlesRef = useRef<Map<number, { isHovered: boolean; triggerGlitch: (ms: number) => void }>>(new Map())
  const sentinelRef = useRef<HTMLDivElement>(null)

  const registerHandle = useCallback((idx: number, handle: { isHovered: boolean; triggerGlitch: (ms: number) => void }) => {
    handlesRef.current.set(idx, handle)
  }, [])

  // Random glitch scheduler
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let lastGlitchEnd = 0

    function scheduleNext() {
      const delay = 2000 + Math.random() * 5000
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

  // Fetch page data
  const fetchPage = useCallback(async (pageNum: number, isNew: boolean, signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(pageNum))
    try {
      const res = await fetch(`/api/tokens/miladies?${params.toString()}`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: MiladiesResponse = await res.json()
      setTokens((prev) => isNew ? data.data : [...prev, ...data.data])
      setTotal(data.total)
      setHasNext(data.hasNext)
      setInitialLoad(false)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to load data.')
    }
    setLoading(false)
  }, [search])

  // Initial load + search reset
  useEffect(() => {
    const controller = new AbortController()
    setPage(1)
    setTokens([])
    setInitialLoad(true)
    fetchPage(1, true, controller.signal)
    return () => controller.abort()
  }, [search, fetchPage])

  // Load more pages
  useEffect(() => {
    if (page <= 1) return
    const controller = new AbortController()
    fetchPage(page, false, controller.signal)
    return () => controller.abort()
  }, [page, fetchPage])

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading) {
          setPage((p) => p + 1)
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNext, loading])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Search — same style as MibeMetadatas */}
      <form onSubmit={handleSearch} className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem', lineHeight: 1, flexShrink: 0 }}>
            Search
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            maxLength={100}
            placeholder="ID, name, ancestor..."
            aria-label="Search miladies by ID, name, ancestor, or archetype"
            style={{ width: '10rem', padding: '0.4rem 0.6rem', lineHeight: 1.2, borderRadius: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
          />
          <button
            type="submit"
            className="btn-go"
            style={{ padding: '0.4rem 0.85rem', lineHeight: 1.2, borderRadius: '0.5rem', background: 'rgb(255, 215, 0)', color: '#000', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgb(184, 156, 50)', cursor: 'pointer', flexShrink: 0 }}
          >
            Go
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput('') }}
              style={{ padding: '0.4rem 0.85rem', lineHeight: 1.2, borderRadius: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: '#888', fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
            >
              Clear
            </button>
          )}
          {total > 0 && (
            <span style={{ color: '#888', fontSize: '0.75rem', marginLeft: 'auto' }}>
              <strong style={{ color: '#fff' }}>{total.toLocaleString()}</strong> miladies
            </span>
          )}
          {error && <span style={{ color: '#f85149', fontSize: '0.75rem' }}>{error}</span>}
        </div>
      </form>

      {/* Grid */}
      <div className="grails-grid">
        {initialLoad
          ? Array.from({ length: 42 }).map((_, i) => <MiladyCardSkeleton key={i} />)
          : tokens.map((token, idx) => (
              <MiladyCard key={token.tokenId} token={token} idx={idx} registerHandle={registerHandle} />
            ))
        }
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '1px' }} />

      {/* Loading more indicator */}
      {loading && !initialLoad && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <div className="img-spinner" />
        </div>
      )}
    </div>
  )
}
