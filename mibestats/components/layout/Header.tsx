'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

// Lazy-load ConnectButton to avoid SSR issues when WagmiProvider is missing
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

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-mibe-border bg-mibe-sidebar shrink-0">
      {/* Left: mobile menu + branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-mibe-text-2 hover:text-mibe-text hover:bg-mibe-hover transition-colors"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link href="/eden" className="lg:hidden font-title text-mibe-gold text-lg">
          Mibestats
        </Link>
      </div>

      {/* Right: wallet connect */}
      <div className="flex items-center gap-3 ml-auto">
        <WalletButton />
      </div>
    </header>
  )
}
