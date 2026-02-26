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
        className="border-r border-mibe-border bg-mibe-sidebar overflow-y-auto"
        style={{
          position: 'fixed',
          left: 0,
          top: '3rem',
          bottom: 0,
          width: '13rem',
          zIndex: 40,
          display: 'none',
        }}
      >
        <SideMenu />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 30,
            }}
            onClick={closeMobile}
          />
          <aside
            className="border-r border-mibe-border bg-mibe-bg overflow-y-auto"
            style={{
              position: 'fixed',
              left: 0,
              top: '3rem',
              bottom: 0,
              width: '14rem',
              zIndex: 40,
            }}
          >
            <SideMenu onNavigate={closeMobile} />
          </aside>
        </>
      )}

      {/* Main content — scrolls naturally */}
      <main
        id="main-content"
        className="p-4 lg:p-6"
        style={{
          marginTop: '3rem',
          marginLeft: 0,
          minHeight: 'calc(100vh - 3rem)',
        }}
      >
        <div className="max-w-6xl w-full">
          {children}
        </div>
      </main>

      {/* Responsive sidebar visibility */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          #desktop-sidebar { display: block !important; }
          #main-content { margin-left: 13rem !important; }
        }
      `}} />
    </>
  )
}
