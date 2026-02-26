'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const WalletButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => {
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

const PAGE_TITLES: Record<string, string> = {
  '/eden': 'MibeEden',
  '/lore': 'MibeLore',
  '/map': 'MibeMap',
  '/distribution': 'MibeDistribution',
  '/timeline': 'MibeTimeline',
  '/metadatas': 'MibeMetadatas',
  '/grails': 'MibeGrails',
  '/miladies': 'Miladies to Mibera',
  '/portfolio': 'Portfolio',
  '/sales': 'Sales',
  '/traits': 'Traits',
}

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] ?? PAGE_TITLES[`/${pathname.split('/')[1]}`] ?? ''

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-mibe-border bg-mibe-sidebar shrink-0">
      {/* Left: mobile menu + branding + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-mibe-text-2 hover:text-mibe-text hover:bg-mibe-hover transition-colors"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <Link href="/eden" className="lg:hidden font-title text-mibe-gold text-lg">
          Mibestats
        </Link>
        {/* Page title — desktop only */}
        {pageTitle && (
          <span className="hidden lg:block text-sm font-medium text-mibe-text-2">
            {pageTitle}
          </span>
        )}
      </div>

      {/* Right: wallet connect */}
      <div className="flex items-center gap-3 ml-auto">
        <WalletButton />
      </div>
    </header>
  )
}
