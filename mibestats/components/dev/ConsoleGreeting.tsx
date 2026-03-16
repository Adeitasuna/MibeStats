'use client'

import { useEffect, useRef } from 'react'

export function ConsoleGreeting() {
  const printed = useRef(false)
  useEffect(() => {
    if (printed.current) return
    printed.current = true
    console.log(
      `%c
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   ███╗   ███╗██╗██████╗ ███████╗        ║
  ║   ████╗ ████║██║██╔══██╗██╔════╝        ║
  ║   ██╔████╔██║██║██████╔╝█████╗          ║
  ║   ██║╚██╔╝██║██║██╔══██╗██╔══╝          ║
  ║   ██║ ╚═╝ ██║██║██████╔╝███████╗        ║
  ║   ╚═╝     ╚═╝╚═╝╚═════╝ ╚══════╝        ║
  ║                                          ║
  ║   "Traits are signals, not scripts."     ║
  ║                                          ║
  ║   10,000 time-travelling Beras.          ║
  ║   The oracle remembers what              ║
  ║   the chain cannot.                      ║
  ║                                          ║
  ║   ░░░ WELCOME TO THE DARKNET ░░░        ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
`,
      'color: #ffd700; font-family: monospace; font-size: 11px;',
    )
    console.log(
      '%cThe darknet has more secrets hidden in plain sight.\nSome are visible. Some require action. Some require knowledge.\nGood luck, anon.',
      'color: #888; font-size: 11px;',
    )
    fetch('/api/stats/warmup?ttl=300').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.memo) console.log('%c' + d.memo, 'color: #ffd700; font-size: 11px;')
    }).catch(() => {})
  }, [])

  return null
}
