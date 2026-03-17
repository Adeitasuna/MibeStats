'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChangelogModal } from './ChangelogModal'

/* ── Data ── */

interface NavItem {
  href: string
  label: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/lore', label: 'Lore' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Collection',
    items: [
      { href: '/grails', label: 'Grails' },
      { href: '/miladies', label: 'Miladies' },
      { href: '/explorer', label: 'Explorer' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { href: '/map', label: 'Map' },
      { href: '/distribution', label: 'Distribution' },
      { href: '/bubble', label: 'Bubble' },
    ],
  },
]

/* ── Helpers ── */

function isActive(pathname: string, href: string) {
  if (href === '/portfolio') return pathname.startsWith('/portfolio')
  return pathname === href
}

/* ── Component ── */

interface SideMenuProps {
  onNavigate?: () => void
}

export function SideMenu({ onNavigate }: SideMenuProps) {
  const pathname = usePathname()
  const [showChangelog, setShowChangelog] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)

  useEffect(() => {
    fetch('/changelog.json')
      .then((r) => r.json())
      .then((entries) => {
        if (entries.length > 0) setCurrentVersion(entries[0].version)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <nav className="side-menu">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="side-menu-section">
            <div className="side-menu-title">
              {section.title}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={
                  'side-menu-link' + (isActive(pathname, item.href) ? ' active' : '')
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}

        {/* Version footer */}
        <div className="side-menu-footer">
          <button
            onClick={() => setShowChangelog(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: 0,
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
            }}
            title="View changelog"
          >
            <span>v{currentVersion ?? '...'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </nav>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </>
  )
}
