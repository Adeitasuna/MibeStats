'use client'

import { useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

type WidgetState = 'idle' | 'open' | 'capturing' | 'submitting' | 'success' | 'error'

export function BugReportWidget() {
  const pathname = usePathname()
  const [state, setState] = useState<WidgetState>('idle')
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [includeScreenshot, setIncludeScreenshot] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const captureScreenshot = useCallback(async () => {
    setState('capturing')
    try {
      // Dynamic import to avoid bundling html2canvas when not needed
      const html2canvas = (await import('html2canvas')).default

      // Hide the modal during capture
      if (modalRef.current) modalRef.current.style.display = 'none'

      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        scale: 0.5, // Reduce size
        ignoreElements: (el) => {
          // Skip elements marked with data-no-capture
          return el.hasAttribute('data-no-capture')
        },
      })

      if (modalRef.current) modalRef.current.style.display = ''

      const dataUrl = canvas.toDataURL('image/png', 0.7)

      // Check size (500KB limit for the base64 string)
      if (dataUrl.length > 500 * 1024 + 22) {
        // Try even lower quality
        const smallerDataUrl = canvas.toDataURL('image/png', 0.3)
        if (smallerDataUrl.length > 500 * 1024 + 22) {
          setScreenshot(null)
          setIncludeScreenshot(false)
          setState('open')
          return
        }
        setScreenshot(smallerDataUrl)
      } else {
        setScreenshot(dataUrl)
      }

      setState('open')
    } catch {
      setState('open')
      setIncludeScreenshot(false)
    }
  }, [])

  const handleOpen = useCallback(async () => {
    setState('open')
    if (includeScreenshot && !screenshot) {
      await captureScreenshot()
    }
  }, [includeScreenshot, screenshot, captureScreenshot])

  const handleSubmit = useCallback(async () => {
    if (description.length < 10) {
      setErrorMsg('Au moins 10 caractères')
      return
    }
    setState('submitting')
    setErrorMsg('')

    try {
      const viewport = `${window.innerWidth}x${window.innerHeight}`
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          screenshot: includeScreenshot && screenshot ? screenshot : undefined,
          page: pathname,
          viewport,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setState('success')
      setTimeout(() => {
        setState('idle')
        setDescription('')
        setScreenshot(null)
        setIncludeScreenshot(true)
      }, 2000)
    } catch (err) {
      setErrorMsg((err as Error).message)
      setState('open')
    }
  }, [description, screenshot, includeScreenshot, pathname])

  const handleClose = useCallback(() => {
    setState('idle')
    setDescription('')
    setScreenshot(null)
    setErrorMsg('')
    setIncludeScreenshot(true)
  }, [])

  if (state === 'idle') {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-[4.5rem] z-50 w-12 h-12 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white shadow-lg flex items-center justify-center transition-all"
        aria-label="Report a bug"
        title="Report a bug"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </button>
    )
  }

  return (
    <div
      ref={modalRef}
      className="fixed bottom-4 right-4 z-50 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4"
      role="dialog"
      aria-label="Bug report"
      data-no-capture
    >
      {state === 'success' ? (
        <div className="text-center py-6">
          <p className="text-lg font-semibold text-green-400">Bug signal&eacute;, merci !</p>
          <p className="text-sm text-zinc-400 mt-1">On regarde ça.</p>
        </div>
      ) : state === 'capturing' ? (
        <div className="text-center py-6">
          <p className="text-sm text-zinc-400">Capture en cours...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-200">Signaler un bug</h3>
            <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-300" aria-label="Close">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrorMsg('') }}
            placeholder="Décris le problème... (min 10 caractères)"
            maxLength={2000}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-purple-500 mb-2"
          />

          {errorMsg && (
            <p className="text-xs text-red-400 mb-2">{errorMsg}</p>
          )}

          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeScreenshot}
                onChange={(e) => {
                  setIncludeScreenshot(e.target.checked)
                  if (e.target.checked && !screenshot) captureScreenshot()
                  if (!e.target.checked) setScreenshot(null)
                }}
                className="rounded bg-zinc-800 border-zinc-600"
              />
              Inclure un screenshot
            </label>
          </div>

          {screenshot && includeScreenshot && (
            <div className="mb-3 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshot}
                alt="Screenshot preview"
                className="w-full rounded border border-zinc-700 max-h-32 object-cover"
              />
              <button
                onClick={() => setScreenshot(null)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-zinc-400 hover:text-white"
                aria-label="Remove screenshot"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={description.length < 10 || state === 'submitting'}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-lg py-2 transition-colors"
          >
            {state === 'submitting' ? 'Envoi...' : 'Envoyer le rapport'}
          </button>
        </>
      )}
    </div>
  )
}
