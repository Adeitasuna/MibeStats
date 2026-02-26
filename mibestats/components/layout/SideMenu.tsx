'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

/* ── Data ── */

interface NavItem {
  href: string
  label: string
}

interface NavSection {
  title: string | null
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { href: '/lore', label: 'MibeLore' },
      { href: '/eden', label: 'MibeEden' },
    ],
  },
  {
    title: 'Datas',
    items: [
      { href: '/map', label: 'MibeMap' },
      { href: '/distribution', label: 'MibeDistribution' },
      { href: '/timeline', label: 'MibeTimeline' },
    ],
  },
  {
    title: 'Play wif mibera',
    items: [
      { href: '/metadatas', label: 'MibeMetadatas' },
      { href: '/grails', label: 'MibeGrails' },
      { href: '/miladies', label: 'Miladies to Mibera' },
    ],
  },
  {
    title: null,
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

/* ── Component ── */

interface SideMenuProps {
  onNavigate?: () => void
}

export function SideMenu({ onNavigate }: SideMenuProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col py-4 px-3 gap-1 font-terminal text-sm">
      {NAV_SECTIONS.map((section, i) => (
        <div key={section.title ?? `section-${i}`}>
          {/* Section title */}
          {section.title && (
            <div className="menu-section-title px-2 pt-3 pb-1 select-none">
              {section.title}
            </div>
          )}

          {/* Items */}
          {section.items.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={clsx(
                  'menu-item block px-2 py-1 rounded-sm',
                  active
                    ? 'active text-mibe-gold'
                    : 'text-mibe-text-2 hover:text-mibe-gold',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}

      {/* Footer */}
      <div className="mt-auto pt-6 px-2 text-[10px] text-mibe-muted leading-relaxed">
        <div className="border-t border-mibe-border pt-3">
          community analytics
          <br />
          for mibera333 on berachain
        </div>
      </div>
    </nav>
  )
}
