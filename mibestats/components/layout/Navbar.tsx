'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const WalletButton = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then((mod) => {
      const { ConnectButton } = mod
      return function WalletBtn() {
        return (
          <ConnectButton
            chainStatus="none"
            accountStatus="avatar"
            showBalance={false}
          />
        )
      }
    }),
  { ssr: false },
)

interface NavbarProps {
  onMenuToggle: () => void
  mobileOpen: boolean
}

export function Navbar({ onMenuToggle, mobileOpen }: NavbarProps) {
  return (
    <header
      className="border-b border-mibe-border bg-mibe-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
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
        <Link href="/eden" className="font-title text-mibe-gold text-lg" style={{ whiteSpace: 'nowrap' }}>
          Mibestats
        </Link>
        <span className="text-mibe-muted text-xs" id="header-subtitle" style={{ whiteSpace: 'nowrap' }}>
          // mibera333 analytics
        </span>
      </div>

      {/* Right: wallet */}
      <div style={{ flexShrink: 0 }}>
        <WalletButton />
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
