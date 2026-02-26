'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { clsx } from 'clsx'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar — hidden on mobile unless mobileOpen */}
      <div
        className={clsx(
          'lg:block',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => {
            setCollapsed((c) => !c)
            setMobileOpen(false)
          }}
          onNavigate={closeMobile}
        />
      </div>

      {/* Main content area */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-56',
        )}
      >
        <Header onMenuToggle={() => setMobileOpen((o) => !o)} />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
