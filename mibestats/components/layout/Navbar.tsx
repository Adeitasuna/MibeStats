'use client'

import Link from 'next/link'
import { useRef, useCallback, useEffect } from 'react'

interface NavbarProps {
  onMenuToggle: () => void
  mobileOpen: boolean
}

export function Navbar({ onMenuToggle, mobileOpen }: NavbarProps) {
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout>>()
  const logoRef = useRef<HTMLAnchorElement>(null)

  // Random glitch on logo every 40-90s
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function scheduleGlitch() {
      const delay = 40000 + Math.random() * 50000
      timer = setTimeout(() => {
        const el = logoRef.current
        if (el) {
          el.classList.add('glitching')
          setTimeout(() => el.classList.remove('glitching'), 300 + Math.random() * 200)
        }
        scheduleGlitch()
      }, delay)
    }
    scheduleGlitch()
    return () => clearTimeout(timer)
  }, [])

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    clickCount.current++
    if (clickCount.current === 3) {
      e.preventDefault()
      clickCount.current = 0
      clearTimeout(clickTimer.current)
      window.open('https://midi.0xhoneyjar.xyz/', '_blank')
      return
    }
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 500)
  }, [])

  return (
    <header
      className="border-b border-mibe-border"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3.5rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        backgroundColor: '#000000',
      }}
    >
      {/* Left: mobile hamburger + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          id="mobile-hamburger"
          onClick={onMenuToggle}
          className="text-mibe-text-2 hover:text-mibe-gold transition-colors"
          style={{ display: 'none' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <Link
          ref={logoRef}
          href="/lore"
          onClick={handleLogoClick}
          className="section-title fugitive-card"
          style={{ whiteSpace: 'nowrap', fontSize: '1.6rem', letterSpacing: '0.05em', textDecoration: 'none', textShadow: '0 0 8px rgba(255,215,0,0.4)', position: 'relative' }}
        >
          MibeStats
        </Link>
        <span className="font-terminal" id="header-subtitle" style={{ whiteSpace: 'nowrap', fontSize: '0.7rem', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          // dark market intelligence
        </span>
      </div>

      {/* Responsive: show hamburger + hide subtitle on mobile */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1023px) {
          #mobile-hamburger { display: block !important; }
        }
        @media (max-width: 639px) {
          #header-subtitle { display: none !important; }
        }
      `}} />
    </header>
  )
}
