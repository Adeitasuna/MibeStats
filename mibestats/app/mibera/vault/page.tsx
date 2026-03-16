'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export default function AccessPage() {
  const [words, setWords] = useState(['', '', '', '', '', '', ''])
  const [hp, setHp] = useState('')
  const [result, setResult] = useState<{ success: boolean; message?: string; wait?: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [codeCanvas, setCodeCanvas] = useState<string | null>(null)
  const [txRef, setPendingCode] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [submitted, setWalletSubmitted] = useState(false)
  const [submitting, setWalletLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c <= 1 ? 0 : c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const setWord = useCallback((idx: number, val: string) => {
    setWords((prev) => {
      const next = [...prev]
      next[idx] = val.toLowerCase().trim()
      return next
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (words.some((w) => !w) || countdown > 0) return
    setLoading(true)
    setResult(null)
    setCodeCanvas(null)
    setPendingCode(null)
    setWalletSubmitted(false)

    try {
      const res = await fetch('/api/cache/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words, ...(hp ? { email: hp } : {}) }),
      })
      const data = await res.json()

      if (data.success && data.code) {
        setResult({ success: true })
        setPendingCode(data.code)
      } else {
        setResult({ success: false, message: data.message || data.error || 'Incorrect.' })
        if (data.wait) {
          setCountdown(data.wait)
        } else if (data.remaining !== undefined && data.remaining > 0) {
          setCountdown(30)
        }
      }
    } catch {
      setResult({ success: false, message: 'Connection failed.' })
    }
    setLoading(false)
  }, [words, hp, countdown])

  const renderCode = useCallback((code: string, wallet: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 110

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 400, 110)
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,215,0' : '0,255,0'},${0.02 + Math.random() * 0.05})`
      ctx.fillRect(Math.random() * 400, Math.random() * 110, 1, 1)
    }

    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = '#ffd700'
    ctx.shadowColor = 'rgba(255,215,0,0.5)'
    ctx.shadowBlur = 10
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(code, 200, 30)

    ctx.shadowBlur = 0
    ctx.font = '11px monospace'
    ctx.fillStyle = '#0f0'
    ctx.fillText(wallet, 200, 60)

    ctx.font = '10px monospace'
    ctx.fillStyle = '#555'
    ctx.fillText('Screenshot this and send it to claim your NFT', 200, 90)

    setCodeCanvas(canvas.toDataURL())
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) return
    if (!txRef) return
    setWalletLoading(true)

    try {
      const res = await fetch('/api/cache/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words, wallet: walletAddress, code: txRef, pseudo }),
      })
      const data = await res.json()
      if (data?.registered) {
        renderCode(txRef, walletAddress)
        setWalletSubmitted(true)
        setRegistered(true)
        setWords(['', '', '', '', '', '', ''])
      }
    } catch {
      renderCode(txRef, walletAddress)
      setWalletSubmitted(true)
    }
    setWalletLoading(false)
  }, [walletAddress, txRef, words, renderCode])

  const handleKeyDown = useCallback((idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Tab') {
      e.preventDefault()
      if (idx < 6) inputRefs.current[idx + 1]?.focus()
    }
    if (e.key === 'Backspace' && !words[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [words, handleSubmit])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-share-tech-mono), monospace',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: '0.5rem',
        padding: '2rem',
        background: 'rgba(255,215,0,0.02)',
        position: 'relative',
      }}>
        <h1 style={{ color: '#ffd700', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '0.15em' }}>
          ACCESS POINT
        </h1>
        <p style={{ color: '#555', fontSize: '0.75rem', textAlign: 'center', marginBottom: '2rem' }}>
          Enter access sequence.
        </p>

        {/* Anti-bot */}
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
        />

        {/* 7 input fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {words.map((word, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#333', fontSize: '0.7rem', width: '1.2rem', textAlign: 'right' }}>{i + 1}.</span>
              <input
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                value={word}
                onChange={(e) => setWord(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                placeholder={`word ${i + 1}`}
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,215,0,0.15)',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  color: '#ffd700',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Submit + countdown */}
        <button
          onClick={handleSubmit}
          disabled={loading || words.some((w) => !w) || countdown > 0}
          style={{
            width: '100%',
            padding: '0.6rem',
            background: countdown > 0 ? 'rgba(255,255,255,0.03)' : words.every((w) => w) ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '0.25rem',
            color: countdown > 0 ? '#555' : words.every((w) => w) ? '#ffd700' : '#333',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
            cursor: countdown > 0 || words.some((w) => !w) ? 'not-allowed' : 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          {loading ? '[ PROCESSING... ]' : countdown > 0 ? `[ WAIT ${countdown}s ]` : '[ VERIFY ]'}
        </button>

        {/* Error */}
        {result && !result.success && (
          <div style={{ marginTop: '1rem', color: '#f85149', fontSize: '0.75rem', textAlign: 'center' }}>
            {result.message}
          </div>
        )}

        {/* Success — wallet input */}
        {result?.success && !submitted && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ color: '#0f0', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              ACCESS GRANTED
            </div>
            <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: '0.75rem', textAlign: 'center' }}>
              Enter your details to generate your claim code.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Your pseudo (Discord, X, etc.)"
                spellCheck={false}
                autoComplete="off"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(0,255,0,0.2)',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  color: '#0f0',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Berachain wallet (0x...)"
                spellCheck={false}
                autoComplete="off"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(0,255,0,0.2)',
                  borderRadius: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  color: '#0f0',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleConfirm}
                disabled={!walletAddress.match(/^0x[a-fA-F0-9]{40}$/) || !pseudo.trim() || submitting}
                style={{
                  padding: '0.5rem 1rem',
                  background: walletAddress.match(/^0x[a-fA-F0-9]{40}$/) && pseudo.trim() ? 'rgba(0,255,0,0.15)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,255,0,0.3)',
                  borderRadius: '0.25rem',
                  color: walletAddress.match(/^0x[a-fA-F0-9]{40}$/) && pseudo.trim() ? '#0f0' : '#333',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  cursor: walletAddress.match(/^0x[a-fA-F0-9]{40}$/) && pseudo.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {submitting ? '...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for rendering */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Success modal */}
        {registered && codeCanvas && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}>
            <div style={{
              maxWidth: '450px',
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid rgba(0,255,0,0.3)',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{ color: '#0f0', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.1em' }}>
                REGISTERED
              </div>
              <img
                src={codeCanvas}
                alt="Claim code"
                style={{ maxWidth: '100%', borderRadius: '0.25rem', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '1rem' }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <p style={{ color: '#0f0', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                Your pseudo, wallet and claim code have been saved.
              </p>
              <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: '1.5rem' }}>
                Screenshot this and tag @adeitasuna on TheHoneyJar Discord to claim your NFT.
              </p>
              <button
                onClick={() => setRegistered(false)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'rgba(0,255,0,0.1)',
                  border: '1px solid rgba(0,255,0,0.3)',
                  borderRadius: '0.25rem',
                  color: '#0f0',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
