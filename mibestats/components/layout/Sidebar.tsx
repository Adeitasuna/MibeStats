'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { clsx } from 'clsx'

interface NavItem {
  href: string
  label: string
}

interface NavSection {
  title: string
  icon: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Lore / Infos',
    icon: '🏠',
    items: [
      { href: '/lore', label: 'MibeLore' },
    ],
  },
  {
    title: 'MagicEden',
    icon: '🛒',
    items: [
      { href: '/eden', label: 'MibeEden' },
    ],
  },
  {
    title: 'Datas',
    icon: '📊',
    items: [
      { href: '/map', label: 'MibeMap' },
      { href: '/distribution', label: 'MibeDistribution' },
      { href: '/timeline', label: 'MibeTimeline' },
    ],
  },
  {
    title: 'Play wif mibera',
    icon: '💛',
    items: [
      { href: '/metadatas', label: 'MibeMetadatas' },
      { href: '/grails', label: 'MibeGrails' },
      { href: '/miladies', label: 'Miladies to Mibera' },
    ],
  },
  {
    title: 'Portfolio',
    icon: '👛',
    items: [
      { href: '/portfolio', label: 'Portfolio' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(NAV_SECTIONS.map((s) => s.title)),
  )

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const isActive = (href: string) => {
    if (href === '/portfolio') return pathname.startsWith('/portfolio')
    return pathname === href
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 border-r',
        'bg-mibe-sidebar border-mibe-border',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b border-mibe-border shrink-0">
        {!collapsed && (
          <Link href="/eden" className="font-title text-mibe-gold text-xl truncate">
            Mibestats
          </Link>
        )}
        <button
          onClick={onToggle}
          className={clsx(
            'p-1.5 rounded-md text-mibe-text-2 hover:text-mibe-text hover:bg-mibe-hover transition-colors',
            collapsed ? 'mx-auto' : 'ml-auto',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            {/* Section header */}
            <button
              onClick={() => !collapsed && toggleSection(section.title)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider',
                'text-mibe-gold hover:bg-mibe-hover/50 transition-colors',
                collapsed && 'justify-center',
              )}
              title={collapsed ? section.title : undefined}
            >
              <span className="text-sm">{section.icon}</span>
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">{section.title}</span>
                  <span className="text-[10px] text-mibe-muted">
                    {openSections.has(section.title) ? '▾' : '▸'}
                  </span>
                </>
              )}
            </button>

            {/* Section items */}
            {(collapsed || openSections.has(section.title)) && (
              <div className="flex flex-col">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'sidebar-item flex items-center gap-2 mx-2 px-3 py-1.5 rounded-md text-sm',
                      isActive(item.href)
                        ? 'active font-medium'
                        : 'text-mibe-text-2 hover:text-mibe-text',
                      collapsed && 'justify-center px-0 mx-1',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {collapsed ? (
                      <span className="text-xs">{item.label.charAt(0)}</span>
                    ) : (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-mibe-border p-3 text-xs text-mibe-muted">
          Community analytics for Mibera333
        </div>
      )}
    </aside>
  )
}
