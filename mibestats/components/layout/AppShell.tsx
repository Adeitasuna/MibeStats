'use client'

import { useState, useCallback } from 'react'
import { Navbar } from './Navbar'
import { SideMenu } from './SideMenu'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* Fixed header */}
      <Navbar
        onMenuToggle={() => setMobileOpen((o) => !o)}
        mobileOpen={mobileOpen}
      />

      {/* Fixed desktop sidebar */}
      <aside
        id="desktop-sidebar"
        className="border-r overflow-y-auto fixed left-0 top-14 bottom-0 w-[calc(100vw/6)] z-40 hidden bg-[var(--menu-bg)] border-[#1e1c16]"
      >
        <SideMenu />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-30"
            onClick={closeMobile}
          />
          <aside
            className="border-r overflow-y-auto fixed left-0 top-14 bottom-0 w-56 z-40 bg-[var(--menu-bg)] border-[#1e1c16]"
          >
            <SideMenu onNavigate={closeMobile} />
          </aside>
        </>
      )}

      {/* Main content — scrolls naturally */}
      <main
        id="main-content"
        className="p-4 lg:p-6 mt-14 ml-0 min-h-[calc(100vh-3.5rem)]"
      >
        <div className="max-w-6xl w-full">
          {children}
        </div>
      </main>

      {/* Responsive sidebar visibility */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          #desktop-sidebar { display: block !important; }
          #main-content { margin-left: calc(100vw / 6) !important; padding-left: 2rem !important; padding-right: 2rem !important; }
        }
      `}} />
    </>
  )
}
