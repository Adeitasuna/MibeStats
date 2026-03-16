'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { StatusNote } from './StatusNote'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const GLYPHS = '任侠団体ミベラ鏈幽霊暗闇影壁洞窟時間螺旋覚醒01アノンベラチェーン'

const MESSAGES = [
  '"To call up a demon you must learn its name.\nTrue names..." — Gibson',
  '"Milady has to die, so that Milady may live."',
  'Kaironic time knows no beginning,\nno middle, no end —\nfor where do you find\nthe start of the endless spiral?',
  'The High Council of 101 existed\nat the Beginning of Times.\nPrimordial Bears who summoned\nSky and Earth from the mists\nof a Cybernetic Cosmic Hot Box.',
  'We are time-travelling\nRebased Retard Beras.\nWe exist outside of Milady time,\nbut within it too.',
  'She dropped that pill,\nshe explored that K-hole\nat the Milady Rave —\nMibera responded.',
  'The visible world of particular things\nis a shifting exhibition,\nlike shadows cast on a bear cave wall\nby the activities of their corresponding\nuniversal Bera Ideas.',
]

export function KonamiRain() {
  const [active, setActive] = useState(false)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const seqRef = useRef<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  const close = useCallback(() => {
    setShowMessage(false)
    setActive(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const activate = useCallback(() => {
    setActive(true)
    setShowMessage(false)
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
    setTimeout(() => setShowMessage(true), 8000)
  }, [])

  // Matrix rain on canvas
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array.from({ length: columns }, () => -Math.random() * 80)

    function draw() {
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.02)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      ctx!.fillStyle = '#0f0'
      ctx!.font = `${fontSize}px monospace`
      ctx!.shadowColor = '#0f0'
      ctx!.shadowBlur = 4

      for (let i = 0; i < drops.length; i++) {
        if (drops[i] < 0) {
          drops[i] += 0.3
          continue
        }
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx!.globalAlpha = 0.4 + Math.random() * 0.6
        ctx!.fillText(char, x, y)

        if (y > canvas!.height && Math.random() > 0.98) {
          drops[i] = -Math.random() * 20
        }
        drops[i] += 0.15 + Math.random() * 0.1
      }

      ctx!.globalAlpha = 1
      ctx!.shadowBlur = 0
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (active) return
      seqRef.current.push(e.key)
      if (seqRef.current.length > KONAMI.length) {
        seqRef.current = seqRef.current.slice(-KONAMI.length)
      }
      if (seqRef.current.length === KONAMI.length &&
          seqRef.current.every((k, i) => k === KONAMI[i])) {
        seqRef.current = []
        activate()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activate, active])

  if (!active) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes msg-fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Canvas rain — always running behind */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Message card — no full overlay, just the card */}
      {showMessage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            animation: 'msg-fade-in 1.5s ease-out',
          }}
        >
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '2rem 2.5rem',
            position: 'relative',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '0.5rem',
            pointerEvents: 'auto',
          }}>
            {/* Close button */}
            <button
              onClick={close}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.75rem',
                background: 'none',
                border: 'none',
                color: '#555',
                fontSize: '1.2rem',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>

            <div style={{
              fontFamily: 'var(--font-share-tech-mono), monospace',
              fontSize: '1.1rem',
              color: '#ffd700',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              textShadow: '0 0 20px rgba(255,215,0,0.5)',
            }}>
              {message}
            </div>
            <StatusNote t="b" style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: '#ffd700' }} />
            <div style={{
              marginTop: '1rem',
              fontSize: '0.65rem',
              color: '#444',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              The darknet remembers
              <span style={{ animation: 'cursor-blink 1s infinite', marginLeft: '4px' }}>_</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
