'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { clsx } from 'clsx'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const NAV_LINKS = [
  { href: '/',          label: 'Overview'  },
  { href: '/traits',    label: 'Traits'    },
  { href: '/sales',     label: 'Sales'     },
  { href: '/portfolio', label: 'Portfolio' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-yellow-400">🐻</span>
          <span>MibeStats</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5',
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Wallet connect (desktop) */}
        <div className="hidden md:block">
          <ConnectButton
            chainStatus="none"
            accountStatus="avatar"
            showBalance={false}
          />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'px-3 py-2 rounded-md text-sm font-medium',
                pathname === href ? 'bg-white/10 text-white' : 'text-gray-400',
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 pb-1">
            <ConnectButton
              chainStatus="none"
              accountStatus="address"
              showBalance={false}
            />
          </div>
        </div>
      )}
    </nav>
  )
}
