'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { clsx } from 'clsx'

/* ── SVG Icon components (inline, no dep) ── */

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

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function IconCollapse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function IconExpand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
    title: 'Lore / Infos',
    icon: IconHome,
    items: [
      { href: '/lore', label: 'MibeLore' },
    ],
  },
  {
    title: 'MagicEden',
    icon: IconShop,
    items: [
      { href: '/eden', label: 'MibeEden' },
    ],
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
    items: [
      { href: '/portfolio', label: 'Portfolio' },
    ],
  },
]

/* ── Component ── */

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
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
          <Link href="/eden" className="font-title text-mibe-gold text-xl truncate" onClick={onNavigate}>
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
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section) => {
          const SectionIcon = section.icon
          return (
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
                <SectionIcon className="shrink-0 text-mibe-gold" />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{section.title}</span>
                    {openSections.has(section.title) ? (
                      <IconChevronDown className="text-mibe-muted shrink-0" />
                    ) : (
                      <IconChevronRight className="text-mibe-muted shrink-0" />
                    )}
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
                      onClick={onNavigate}
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
                        <span className="text-xs font-medium">{item.label.slice(0, 2)}</span>
                      ) : (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-mibe-border p-3 text-[10px] text-mibe-muted text-center">
          Community analytics for Mibera333
        </div>
      )}
    </aside>
  )
}
