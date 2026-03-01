'use client'

import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { FugitiveCard } from '@/lib/lore-data'

interface FugitiveGridProps {
  fugitives: FugitiveCard[]
}

function FugitiveCardEl({ fugitive, idx }: { fugitive: FugitiveCard; idx: number }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const isHovered = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const triggerGlitch = useCallback((durationMs: number) => {
    const el = ref.current
    if (!el) return
    el.classList.add('glitching')
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      el.classList.remove('glitching')
    }, durationMs)
  }, [])

  // Hover: glitch for 0.5–1.5s then stop
  const onMouseEnter = useCallback(() => {
    isHovered.current = true
    const duration = 500 + Math.random() * 1000
    triggerGlitch(duration)
  }, [triggerGlitch])

  const onMouseLeave = useCallback(() => {
    isHovered.current = false
    const el = ref.current
    if (el) el.classList.remove('glitching')
    clearTimeout(timeoutRef.current)
  }, [])

  // Random idle glitch — only when NOT hovered
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function scheduleRandom() {
      const delay = 4000 + Math.random() * 12000 // 4–16s between random glitches
      timer = setTimeout(() => {
        if (!isHovered.current) {
          const duration = 500 + Math.random() * 500 // 0.5–1s
          triggerGlitch(duration)
        }
        scheduleRandom()
      }, delay)
    }

    // Stagger initial start per card
    const initialDelay = 2000 + Math.random() * 8000
    timer = setTimeout(() => {
      scheduleRandom()
    }, initialDelay)

    return () => clearTimeout(timer)
  }, [triggerGlitch])

  return (
    <a
      ref={ref}
      href={`https://x.com/${fugitive.handle.replace('@', '')}`}
      target="_blank"
      rel="noreferrer"
      className="fugitive-card"
      style={{
        textDecoration: 'none',
        background: '#111',
        border: '1px solid #f85149',
        borderRadius: '4px',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header bar */}
      <div style={{
        background: '#f85149',
        color: '#000',
        padding: '0.3rem 0.6rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span className="font-terminal" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          WANTED
        </span>
        <span className="font-terminal" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
          #{String(idx + 1).padStart(3, '0')}
        </span>
      </div>

      {/* Card body */}
      <div style={{ display: 'flex', padding: '0.75rem', gap: '0.75rem' }}>
        {/* Mugshot */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{
            width: '70px', height: '70px',
            border: '2px solid #333',
            overflow: 'hidden',
            background: '#1a1a1a',
          }}>
            {fugitive.avatarUrl ? (
              <Image
                src={fugitive.avatarUrl}
                alt={fugitive.displayName}
                width={70}
                height={70}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                unoptimized
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" style={{ color: '#555' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <span className="font-terminal" style={{ fontSize: '0.7rem', color: '#58a6ff' }}>
            {fugitive.handle}
          </span>
        </div>

        {/* Intel */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div>
            <span className="font-terminal" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              {fugitive.displayName}
            </span>
            {fugitive.alias && (
              <span className="font-terminal" style={{ fontSize: '0.8rem', color: '#ffd700', marginLeft: '0.4rem' }}>
                aka &quot;{fugitive.alias}&quot;
              </span>
            )}
          </div>
          <div>
            <span className="font-terminal" style={{ fontSize: '0.7rem', color: '#f85149', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile: </span>
            <span style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: 1.4 }}>{fugitive.profile}</span>
          </div>
          <div>
            <span className="font-terminal" style={{ fontSize: '0.7rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facts: </span>
            <span style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.4 }}>{fugitive.facts}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export function FugitiveGrid({ fugitives }: FugitiveGridProps) {
  return (
    <section>
      <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
        Searched by the FBI: TOP 7 fugitives
      </h2>
      <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '0.5rem' }} />
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
        The most wanted accounts in the Mibera ecosystem
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.75rem' }}>
        {fugitives.map((fugitive, idx) => (
          <FugitiveCardEl key={fugitive.handle} fugitive={fugitive} idx={idx} />
        ))}
      </div>
    </section>
  )
}
