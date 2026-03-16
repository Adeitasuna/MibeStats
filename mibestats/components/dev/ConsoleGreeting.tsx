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
      '%c👁️ Layer 1/? found. %cThe darknet has more secrets hidden in plain sight.\n' +
      '%cSome are visible. Some require action. Some require knowledge.\n' +
      '%cGood luck, anon.',
      'color: #ffd700; font-size: 11px;',
      'color: #888; font-size: 11px;',
      'color: #555; font-style: italic; font-size: 10px;',
      'color: #333; font-size: 10px;',
    )
  }, [])

  return null
}
