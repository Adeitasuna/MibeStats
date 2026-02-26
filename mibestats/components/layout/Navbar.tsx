'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { clsx } from 'clsx'
import dynamic from 'next/dynamic'

/* ── Wallet button (SSR-safe) ── */

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

/* ── SVG Icon components ── */

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  )
}

function IconShop({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  )
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  )
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  )
}

function IconWallet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  )
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

/* ── Data ── */

interface NavItem {
  href: string
  label: string
}

interface NavSection {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MibeLore',
    icon: IconHome,
    items: [{ href: '/lore', label: 'MibeLore' }],
  },
  {
    title: 'MibeEden',
    icon: IconShop,
    items: [{ href: '/eden', label: 'MibeEden' }],
  },
  {
    title: 'Datas',
    icon: IconChart,
    items: [
      { href: '/map', label: 'MibeMap' },
      { href: '/distribution', label: 'MibeDistribution' },
      { href: '/timeline', label: 'MibeTimeline' },
    ],
  },
  {
    title: 'Play wif mibera',
    icon: IconHeart,
    items: [
      { href: '/metadatas', label: 'MibeMetadatas' },
      { href: '/grails', label: 'MibeGrails' },
      { href: '/miladies', label: 'Miladies to Mibera' },
    ],
  },
  {
    title: 'Portfolio',
    icon: IconWallet,
    items: [{ href: '/portfolio', label: 'Portfolio' }],
  },
]

/* ── Helpers ── */

function isActive(pathname: string, href: string) {
  if (href === '/portfolio') return pathname.startsWith('/portfolio')
  return pathname === href
}

function isSectionActive(pathname: string, section: NavSection) {
  return section.items.some((item) => isActive(pathname, item.href))
}

/* ── Component ── */

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-mibe-border bg-mibe-sidebar">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/eden" className="font-title text-xl text-mibe-gold shrink-0">
          Mibestats
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 ml-8">
          {NAV_SECTIONS.map((section) => {
            const isSingle = section.items.length === 1
            const active = isSectionActive(pathname, section)

            if (isSingle) {
              /* Direct link for single-item sections */
              const item = section.items[0]
              return (
                <li key={section.title}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'navbar-link flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'active text-mibe-gold border-b-2 border-mibe-gold'
                        : 'text-mibe-gold/80 hover:text-mibe-gold hover:bg-mibe-hover/50',
                    )}
                  >
                    <section.icon className="text-mibe-gold" />
                    {section.title}
                  </Link>
                </li>
              )
            }

            /* Dropdown for multi-item sections */
            return (
              <li key={section.title} className="relative group">
                <button
                  className={clsx(
                    'navbar-link flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'active text-mibe-gold border-b-2 border-mibe-gold'
                      : 'text-mibe-gold/80 hover:text-mibe-gold hover:bg-mibe-hover/50',
                  )}
                >
                  <section.icon className="text-mibe-gold" />
                  {section.title}
                  <IconChevronDown className="text-mibe-gold/60" />
                </button>

                {/* Dropdown panel */}
                <div className="navbar-dropdown absolute left-0 top-full pt-1 hidden group-hover:block">
                  <div className="min-w-[180px] rounded-lg border border-mibe-border bg-mibe-sidebar py-1 shadow-lg shadow-black/40">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          'block px-4 py-2 text-sm transition-colors',
                          isActive(pathname, item.href)
                            ? 'text-mibe-gold bg-mibe-hover/50 font-medium'
                            : 'text-white hover:text-mibe-gold hover:bg-mibe-hover/50',
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Right side: wallet + mobile hamburger */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:block">
            <WalletButton />
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-md text-mibe-text-2 hover:text-mibe-text hover:bg-mibe-hover transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-mibe-border px-4 py-3 flex flex-col gap-1 bg-mibe-sidebar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {section.items.length === 1 ? (
                <Link
                  href={section.items[0].href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
                    isActive(pathname, section.items[0].href)
                      ? 'text-mibe-gold bg-mibe-hover/50'
                      : 'text-mibe-gold/80 hover:text-mibe-gold',
                  )}
                >
                  <section.icon className="text-mibe-gold" />
                  {section.title}
                </Link>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-mibe-gold">
                    <section.icon className="text-mibe-gold" />
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        'block pl-10 pr-3 py-1.5 rounded-md text-sm',
                        isActive(pathname, item.href)
                          ? 'text-mibe-gold bg-mibe-hover/50 font-medium'
                          : 'text-white hover:text-mibe-gold hover:bg-mibe-hover/30',
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          ))}
          <div className="pt-3 pb-1 border-t border-mibe-border mt-2">
            <WalletButton />
          </div>
        </div>
      )}
    </nav>
  )
}
