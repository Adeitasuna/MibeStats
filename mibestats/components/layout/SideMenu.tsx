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
    title: 'Explore',
    items: [
      { href: '/lore', label: 'MibeLore' },
      { href: '/eden', label: 'MibeEden' },
    ],
  },
  {
    title: 'Datas',
    items: [
      { href: '/map', label: 'MibeMap' },
      { href: '/distribution', label: 'MibeDistrib.' },
      { href: '/timeline', label: 'MibeTimeline' },
    ],
  },
  {
    title: 'Play wif mibera',
    items: [
      { href: '/metadatas', label: 'MibeMetadatas' },
      { href: '/grails', label: 'MibeGrails' },
      { href: '/miladies', label: 'Miladies' },
    ],
  },
  {
    title: 'Wallet',
    items: [
      { href: '/portfolio', label: 'Portfolio' },
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
