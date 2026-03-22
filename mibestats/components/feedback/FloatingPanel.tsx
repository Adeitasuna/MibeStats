'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

// ─── NPS faces (Mibera-themed ASCII art) ────────────────────────────────────────

// Mibera face images (local copies in public/faces/)
const FACES = [
  { score: 1, label: 'BAD',  color: '#ef4444', img: '/faces/bad.png' },
  { score: 3, label: 'FINE', color: '#eab308', img: '/faces/fine.png' },
  { score: 5, label: 'GOOD', color: '#16a34a', img: '/faces/good.png' },
]

// ─── Bug categories ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'data',        icon: '⚡', label: 'Wrong data',       desc: 'Stats, prices, or traits are incorrect', hasScreenshot: true },
  { id: 'display',     icon: '👁',  label: 'Display issue',    desc: 'Layout broken, text overlap, missing images', hasScreenshot: true },
  { id: 'performance', icon: '🐌', label: 'Slow / stuck',     desc: 'Page takes forever or never loads', hasScreenshot: false },
  { id: 'idea',        icon: '💡', label: 'Feature idea',     desc: 'Something you wish MibeStats had', hasScreenshot: false },
  { id: 'other',       icon: '☠',  label: 'Other',            desc: 'Anything else worth reporting', hasScreenshot: true },
]

type PanelView = 'collapsed' | 'menu' | 'feedback' | 'bug-category' | 'bug-detail' | 'success'

export function FloatingPanel() {
  const pathname = usePathname()
  const [view, setView] = useState<PanelView>('collapsed')
  const [score, setScore] = useState<number | null>(null)
  const [bugCategory, setBugCategory] = useState<string | null>(null)
  const [bugDesc, setBugDesc] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [includeScreenshot, setIncludeScreenshot] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ─── Drag state ─────────────────────────────────────────────────────────────
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [initialized, setInitialized] = useState(false)
  const dragging = useRef(false)
  const didDrag = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined' || initialized) return
    const saved = localStorage.getItem('fp_y')
    if (saved) {
      const y = Math.min(Number(saved) || 0, window.innerHeight - 80)
      setPos({ x: 0, y })
    } else {
      setPos({ x: 0, y: window.innerHeight / 2 - 40 })
    }
    setInitialized(true)
  }, [initialized])

  useEffect(() => {
    if (initialized) localStorage.setItem('fp_y', String(pos.y))
  }, [pos.y, initialized])

  // ─── Drag handlers (vertical only) ────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, label')) return
    dragging.current = true
    didDrag.current = false
    dragOffset.current = { x: 0, y: e.clientY - pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      didDrag.current = true
      setPos((p) => ({ ...p, y: Math.max(60, Math.min(window.innerHeight - 80, e.clientY - dragOffset.current.y)) }))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, label')) return
    const t = e.touches[0]
    dragging.current = true
    didDrag.current = false
    dragOffset.current = { x: 0, y: t.clientY - pos.y }
  }, [pos])

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragging.current) return
      didDrag.current = true
      const t = e.touches[0]
      setPos((p) => ({ ...p, y: Math.max(60, Math.min(window.innerHeight - 80, t.clientY - dragOffset.current.y)) }))
    }
    const onEnd = () => { dragging.current = false }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
  }, [])

  // ─── Console error capture (ring buffer of last 20 errors) ─────────────────
  const consoleErrors = useRef<string[]>([])
  useEffect(() => {
    const origError = console.error
    console.error = (...args: unknown[]) => {
      origError.apply(console, args)
      const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ').slice(0, 500)
      consoleErrors.current.push(msg)
      if (consoleErrors.current.length > 20) consoleErrors.current.shift()
    }
    // Also catch unhandled errors
    const onError = (e: ErrorEvent) => {
      const msg = `${e.message} at ${e.filename}:${e.lineno}`.slice(0, 500)
      consoleErrors.current.push(msg)
      if (consoleErrors.current.length > 20) consoleErrors.current.shift()
    }
    window.addEventListener('error', onError)
    return () => { console.error = origError; window.removeEventListener('error', onError) }
  }, [])

  // ─── Screenshot capture ─────────────────────────────────────────────────────
  const captureScreenshot = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      if (panelRef.current) panelRef.current.style.visibility = 'hidden'
      const canvas = await html2canvas(document.body, {
        logging: false, useCORS: true, scale: 0.5,
        ignoreElements: (el) => el.hasAttribute('data-no-capture'),
      })
      if (panelRef.current) panelRef.current.style.visibility = ''
      const dataUrl = canvas.toDataURL('image/png', 0.7)
      if (dataUrl.length > 500 * 1024 + 22) {
        const smaller = canvas.toDataURL('image/png', 0.3)
        if (smaller.length > 500 * 1024 + 22) { setIncludeScreenshot(false); return }
        setScreenshot(smaller)
      } else {
        setScreenshot(dataUrl)
      }
    } catch { setIncludeScreenshot(false) }
  }, [])

  // ─── MibeID (localStorage-based persistent identifier) ─────────────────
  const getMibeId = useCallback(() => {
    if (typeof window === 'undefined') return undefined
    let id = localStorage.getItem('mibeid')
    if (!id) {
      id = `mibe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem('mibeid', id)
    }
    return id
  }, [])

  // ─── Get connected wallet if available ────────────────────────────────────
  const getWallet = useCallback(() => {
    if (typeof window === 'undefined') return undefined
    try {
      // wagmi stores connected account in localStorage
      const raw = localStorage.getItem('wagmi.store')
      if (!raw) return undefined
      const parsed = JSON.parse(raw)
      const addr = parsed?.state?.connections?.value?.[0]?.[1]?.accounts?.[0]
      return addr ?? undefined
    } catch { return undefined }
  }, [])

  // ─── Submit feedback (score 1/3/5 direct) ────────────────────────────────
  const submitFeedback = useCallback(async () => {
    if (score === null) return
    setSubmitting(true); setErrorMsg('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, page: pathname, wallet: getWallet(), visitorId: getMibeId() }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Error') }
      setSuccessMsg('Intel received. The Council is watching.')
      setView('success')
      setTimeout(() => { setView('collapsed'); setScore(null); setSuccessMsg('') }, 2000)
    } catch (err) { setErrorMsg((err as Error).message) }
    finally { setSubmitting(false) }
  }, [score, pathname])

  // ─── Submit bug ─────────────────────────────────────────────────────────────
  const submitBug = useCallback(async () => {
    if (bugDesc.length < 10) { setErrorMsg('At least 10 characters'); return }
    setSubmitting(true); setErrorMsg('')
    try {
      const cat = CATEGORIES.find((c) => c.id === bugCategory)
      const fullDesc = `[${cat?.label ?? 'Other'}] ${bugDesc}`
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: fullDesc,
          screenshot: includeScreenshot && screenshot ? screenshot : undefined,
          consoleErrors: ['data', 'display', 'performance', 'other'].includes(bugCategory ?? '') && consoleErrors.current.length > 0
            ? consoleErrors.current.slice() : undefined,
          page: pathname,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          wallet: getWallet(),
          visitorId: getMibeId(),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Error') }
      const msg = bugCategory === 'idea' ? 'Idea logged. The Council will consider it.' : 'Glitch logged. We\'re on it.'
      setSuccessMsg(msg)
      setView('success')
      setTimeout(() => { setView('collapsed'); setBugDesc(''); setBugCategory(null); setScreenshot(null); setSuccessMsg('') }, 2500)
    } catch (err) { setErrorMsg((err as Error).message) }
    finally { setSubmitting(false) }
  }, [bugDesc, bugCategory, screenshot, includeScreenshot, pathname])

  // ─── Category select → detail ─────────────────────────────────────────────
  const selectCategory = useCallback((id: string) => {
    setBugCategory(id)
    setIncludeScreenshot(false)
    setScreenshot(null)
    setView('bug-detail')
  }, [captureScreenshot])

  // ─── Close / reset ────────────────────────────────────────────────────────
  const close = useCallback(() => {
    setView('collapsed'); setScore(null); setBugDesc(''); setBugCategory(null)
    setScreenshot(null); setErrorMsg(''); setIncludeScreenshot(true)
  }, [])

  if (!initialized) return null

  // ─── Collapsed tab ────────────────────────────────────────────────────────
  if (view === 'collapsed') {
    return (
      <div ref={panelRef} data-no-capture className="fp-tab" style={{ top: pos.y }}
        onMouseDown={onMouseDown} onTouchStart={onTouchStart}
        onClick={() => { if (!didDrag.current) setView('menu') }} title="Send a signal to the Council">
        <span className="fp-tab-text">☠ SIGNAL</span>
      </div>
    )
  }

  // ─── Expanded panel ───────────────────────────────────────────────────────
  return (
    <div ref={panelRef} data-no-capture className="fp-panel" style={{ right: 0, top: pos.y }}
      onMouseDown={onMouseDown} onTouchStart={onTouchStart}>

      {/* Header */}
      <div className="fp-header">
        <div className="fp-drag-hint">⠿ drag</div>
        <button onClick={close} className="fp-close" aria-label="Close">✕</button>
      </div>

      {/* Success */}
      {view === 'success' && <div className="fp-success">{successMsg}</div>}

      {/* Menu */}
      {view === 'menu' && (
        <div className="fp-menu">
          <button onClick={() => setView('feedback')} className="fp-menu-btn fp-menu-feedback">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Drop intel
          </button>
          <button onClick={() => setView('bug-category')} className="fp-menu-btn fp-menu-bug">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Report a glitch
          </button>
        </div>
      )}

      {/* ── Feedback: 5 Mibera faces ─────────────────────────────────────────── */}
      {view === 'feedback' && (
        <div className="fp-form">
          <p className="fp-label">How does your score feel?</p>
          <div className="fp-faces">
            {FACES.map((f) => (
              <button key={f.score} onClick={() => { setScore(f.score); }}
                className={`fp-face ${score === f.score ? 'fp-face--active' : ''}`}
                style={{ '--face-color': f.color } as React.CSSProperties}
                title={f.label}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt={f.label} className="fp-face-img" />
                <span className="fp-face-label">{f.label}</span>
              </button>
            ))}
          </div>
          {errorMsg && <p className="fp-error">{errorMsg}</p>}
          <div className="fp-actions">
            <button onClick={() => { setView('menu'); setScore(null) }} className="btn-ghost">Back</button>
            <button onClick={submitFeedback} disabled={score === null || submitting} className="wallet-btn fp-submit">
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* ── Bug: category picker ─────────────────────────────────────────────── */}
      {view === 'bug-category' && (
        <div className="fp-form">
          <p className="fp-label">What happened?</p>
          <div className="fp-categories">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => selectCategory(cat.id)} className="fp-cat-btn">
                <span className="fp-cat-icon">{cat.icon}</span>
                <div>
                  <span className="fp-cat-label">{cat.label}</span>
                  <span className="fp-cat-desc">{cat.desc}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="fp-actions">
            <button onClick={() => setView('menu')} className="btn-ghost">Back</button>
          </div>
        </div>
      )}

      {/* ── Bug: detail form ─────────────────────────────────────────────────── */}
      {view === 'bug-detail' && (
        <div className="fp-form">
          <p className="fp-label">
            {CATEGORIES.find((c) => c.id === bugCategory)?.icon}{' '}
            {CATEGORIES.find((c) => c.id === bugCategory)?.label}
          </p>
          <textarea value={bugDesc} onChange={(e) => { setBugDesc(e.target.value); setErrorMsg('') }}
            placeholder={bugCategory === 'idea' ? 'Describe your idea... (min 10 chars)' : 'Describe the issue... (min 10 chars)'}
            maxLength={2000} rows={3} className="fp-textarea" autoFocus />
          {!includeScreenshot && CATEGORIES.find((c) => c.id === bugCategory)?.hasScreenshot && (
            <button onClick={() => { setIncludeScreenshot(true); captureScreenshot() }}
              className="btn-ghost" style={{ fontSize: '0.7rem', alignSelf: 'flex-start' }}>
              + Add screenshot
            </button>
          )}
          {includeScreenshot && screenshot && (
            <div className="fp-screenshot-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshot} alt="Screenshot" />
              <button onClick={() => { setScreenshot(null); setIncludeScreenshot(false) }} className="fp-screenshot-remove" aria-label="Remove">✕</button>
            </div>
          )}
          {includeScreenshot && !screenshot && (
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Capturing...</p>
          )}
          {errorMsg && <p className="fp-error">{errorMsg}</p>}
          <div className="fp-actions">
            <button onClick={() => { setView('bug-category'); setBugDesc(''); setErrorMsg('') }} className="btn-ghost">Back</button>
            <button onClick={submitBug} disabled={bugDesc.length < 10 || submitting}
              className="wallet-btn fp-submit"
              style={bugCategory === 'idea' ? {} : { backgroundColor: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
