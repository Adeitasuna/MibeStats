'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

const SEQ = ['m', 'i', 'b', 'e', 'r', 'a']

export function MiberaWord() {
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const seqRef = useRef<string[]>([])

  const activate = useCallback(() => {
    fetch('/api/tokens/refresh?limit=100')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.hint) {
          setMsg(d.hint)
          setShow(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't capture when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      seqRef.current.push(e.key.toLowerCase())
      if (seqRef.current.length > SEQ.length) {
        seqRef.current = seqRef.current.slice(-SEQ.length)
      }
      if (seqRef.current.length === SEQ.length &&
          seqRef.current.every((k, i) => k === SEQ[i])) {
        seqRef.current = []
        activate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activate])

  if (!show || !msg) return null

  return (
    <div
      onClick={() => setShow(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: 'center',
          maxWidth: '400px',
          padding: '2rem',
          background: 'rgba(0,0,0,0.9)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: '0.5rem',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShow(false)}
          style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', background: 'none', border: 'none', color: '#555', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}
        >
          ×
        </button>
        <div style={{
          fontFamily: 'var(--font-share-tech-mono), monospace',
          fontSize: '0.8rem',
          color: '#555',
          marginBottom: '1rem',
          letterSpacing: '0.1em',
        }}>
          &quot;To call up a demon you must learn its name.&quot;
        </div>
        <div style={{
          fontFamily: 'var(--font-share-tech-mono), monospace',
          fontSize: '1rem',
          color: '#ffd700',
          lineHeight: 1.8,
          textShadow: '0 0 15px rgba(255,215,0,0.4)',
        }}>
          {msg}
        </div>
      </div>
    </div>
  )
}
