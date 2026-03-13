'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/lore', label: 'Lore' },
    ],
  },
  {
    title: 'Collection',
    items: [
      { href: '/grails', label: 'Grails' },
      { href: '/miladies', label: 'Miladies' },
      { href: '/metadatas', label: 'Explorer' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { href: '/map', label: 'Map' },
      { href: '/distribution', label: 'Distribution' },
      { href: '/mibebubble', label: 'Bubble' },
    ],
  },
]

/* ── Helpers ── */

function isActive(pathname: string, href: string) {
  if (href === '/portfolio') return pathname.startsWith('/portfolio')
  return pathname === href
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/* ── Component ── */

interface SideMenuProps {
  onNavigate?: () => void
}

export function SideMenu({ onNavigate }: SideMenuProps) {
  const pathname = usePathname()
  const version = process.env.NEXT_PUBLIC_GIT_HASH ?? 'dev'
  const buildDate = process.env.NEXT_PUBLIC_GIT_DATE ?? ''

  return (
    <nav className="side-menu">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="side-menu-section">
          {/* Section title — non-clickable separator */}
          <div className="side-menu-title">
            {section.title}
          </div>

          {/* Menu items */}
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
        <span>v.{version}</span>
        {buildDate && <span>{formatDate(buildDate)}</span>}
      </div>
    </nav>
  )
}
