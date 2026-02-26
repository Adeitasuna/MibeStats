'use client'

import { useState, useCallback } from 'react'
import { Navbar } from './Navbar'
import { SideMenu } from './SideMenu'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <Navbar
        onMenuToggle={() => setMobileOpen((o) => !o)}
        mobileOpen={mobileOpen}
      />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-52 border-r border-mibe-border bg-mibe-sidebar shrink-0 overflow-y-auto">
          <SideMenu />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/70 z-30 lg:hidden"
              onClick={closeMobile}
            />
            <aside className="fixed left-0 top-12 bottom-0 w-56 z-40 bg-mibe-bg border-r border-mibe-border overflow-y-auto lg:hidden">
              <SideMenu onNavigate={closeMobile} />
            </aside>
          </>
        )}

        {/* Main content — scrolls independently */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
