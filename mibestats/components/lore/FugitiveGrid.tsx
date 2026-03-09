'use client'

import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { FugitiveCard } from '@/lib/lore-data'

interface FugitiveGridProps {
  fugitives: FugitiveCard[]
}

/** Per-card state exposed to the parent scheduler */
interface CardHandle {
  isHovered: boolean
  triggerGlitch: (durationMs: number) => void
}

function FugitiveCardEl({
  fugitive,
  idx,
  registerHandle,
}: {
  fugitive: FugitiveCard
  idx: number
  registerHandle: (idx: number, handle: CardHandle) => void
}) {
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

  // Register this card's handle with parent on mount
  useEffect(() => {
    registerHandle(idx, { isHovered: false, triggerGlitch })
  }, [idx, registerHandle, triggerGlitch])

  const onMouseEnter = useCallback(() => {
    isHovered.current = true
    // Update the handle so the scheduler sees it
    registerHandle(idx, { isHovered: true, triggerGlitch })
    const duration = 500 + Math.random() * 1000
    triggerGlitch(duration)
  }, [idx, registerHandle, triggerGlitch])

  const onMouseLeave = useCallback(() => {
    isHovered.current = false
    registerHandle(idx, { isHovered: false, triggerGlitch })
    const el = ref.current
    if (el) el.classList.remove('glitching')
    clearTimeout(timeoutRef.current)
  }, [idx, registerHandle, triggerGlitch])

  return (
    <a
      ref={ref}
      href={fugitive.url || `https://x.com/${fugitive.handle.replace('@', '')}`}
      target="_blank"
      rel="noreferrer"
      className="fugitive-card no-underline bg-mibe-bg-alt border border-mibe-red rounded"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header bar */}
      <div className="bg-mibe-red text-black px-2.5 py-1 flex justify-between items-center">
        <span className="font-terminal text-xs font-bold tracking-widest uppercase">
          WANTED
        </span>
        <span className="font-terminal text-[0.7rem] font-semibold">
          #{String(idx + 1).padStart(3, '0')}
        </span>
      </div>

      {/* Card body */}
      <div className="flex p-3 gap-3">
        {/* Mugshot */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="w-[70px] h-[70px] border-2 border-[#333] overflow-hidden bg-mibe-hover">
            {fugitive.avatarUrl ? (
              <Image
                src={fugitive.avatarUrl}
                alt={fugitive.displayName}
                width={70}
                height={70}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="32" height="32" className="text-mibe-muted" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <span className="font-terminal text-[0.7rem] text-mibe-cyan">
            {fugitive.handle}
          </span>
        </div>

        {/* Intel */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div>
            <span className="font-terminal text-[0.95rem] font-bold text-white">
              {fugitive.displayName}
            </span>
            {fugitive.alias && (
              <span className="font-terminal text-[0.8rem] text-mibe-gold ml-1.5">
                aka &quot;{fugitive.alias}&quot;
              </span>
            )}
          </div>
          <div>
            <span className="font-terminal text-[0.7rem] text-mibe-red uppercase tracking-wider">Profile: </span>
            <span className="text-[0.8rem] text-[#ccc] leading-relaxed">{fugitive.profile}</span>
          </div>
          <div>
            <span className="font-terminal text-[0.7rem] text-mibe-gold uppercase tracking-wider">Facts: </span>
            <span className="text-[0.8rem] text-mibe-text-2 leading-relaxed">{fugitive.facts}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export function FugitiveGrid({ fugitives }: FugitiveGridProps) {
  const handlesRef = useRef<Map<number, CardHandle>>(new Map())

  const registerHandle = useCallback((idx: number, handle: CardHandle) => {
    handlesRef.current.set(idx, handle)
  }, [])

  // Centralized random glitch scheduler — one card at a time, 2s+ gap
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let lastGlitchEnd = 0

    function scheduleNext() {
      // Random delay: 3–10s between glitches (organic feel)
      const delay = 3000 + Math.random() * 7000
      timer = setTimeout(() => {
        const now = Date.now()
        // Enforce minimum 2s since last glitch finished
        if (now - lastGlitchEnd < 2000) {
          scheduleNext()
          return
        }

        // Pick a random non-hovered card
        const candidates: number[] = []
        handlesRef.current.forEach((handle, idx) => {
          if (!handle.isHovered) candidates.push(idx)
        })

        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)]
          const handle = handlesRef.current.get(pick)
          if (handle) {
            const duration = 500 + Math.random() * 500 // 0.5–1s
            handle.triggerGlitch(duration)
            lastGlitchEnd = now + duration
          }
        }

        scheduleNext()
      }, delay)
    }

    // Initial delay before first random glitch
    const initialDelay = 3000 + Math.random() * 4000
    timer = setTimeout(scheduleNext, initialDelay)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section>
      <h2 className="separator">
        Searched by the FBI: TOP 7 fugitives
      </h2>
      <p className="chapo-h2 mb-4">
        The most wanted accounts in the Mibera ecosystem
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3">
        {fugitives.map((fugitive, idx) => (
          <FugitiveCardEl
            key={fugitive.handle}
            fugitive={fugitive}
            idx={idx}
            registerHandle={registerHandle}
          />
        ))}
      </div>
    </section>
  )
}
