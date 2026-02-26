'use client'

import { useState, useCallback } from 'react'
import { Navbar } from './Navbar'
import { SideMenu } from './SideMenu'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <Navbar
        onMenuToggle={() => setMobileOpen((o) => !o)}
        mobileOpen={mobileOpen}
      />

      {/* Body: sidebar + content */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* Desktop sidebar */}
        <aside
          className="border-r border-mibe-border bg-mibe-sidebar"
          style={{
            width: '13rem',
            minWidth: '13rem',
            flexShrink: 0,
            overflowY: 'auto',
            display: 'none',
          }}
          id="desktop-sidebar"
        >
          <SideMenu />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <>
            <div
              className="lg:hidden"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 30,
              }}
              onClick={closeMobile}
            />
            <aside
              className="lg:hidden border-r border-mibe-border bg-mibe-bg"
              style={{
                position: 'fixed',
                left: 0,
                top: '3rem',
                bottom: 0,
                width: '14rem',
                zIndex: 40,
                overflowY: 'auto',
              }}
            >
              <SideMenu onNavigate={closeMobile} />
            </aside>
          </>
        )}

        {/* Main content — scrolls independently */}
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }} className="p-4 lg:p-6">
          <div className="max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Show desktop sidebar at lg+ via CSS */}
      <style>{`
        @media (min-width: 1024px) {
          #desktop-sidebar { display: block !important; }
        }
      `}</style>
    </div>
  )
}
