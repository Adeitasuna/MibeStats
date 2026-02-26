'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { clsx } from 'clsx'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
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
        />
      </div>

      {/* Main content area */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-56',
        )}
      >
        <Header onMenuToggle={() => setMobileOpen((o) => !o)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
