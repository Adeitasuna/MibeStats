'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const SCORE_LABELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
const SCORE_COLORS: Record<number, string> = {
  0: 'bg-red-600', 1: 'bg-red-500', 2: 'bg-red-400',
  3: 'bg-orange-500', 4: 'bg-orange-400', 5: 'bg-yellow-500',
  6: 'bg-yellow-400', 7: 'bg-lime-400', 8: 'bg-green-400',
  9: 'bg-green-500', 10: 'bg-green-600',
}

type WidgetState = 'idle' | 'open' | 'submitting' | 'success' | 'error'

export function FeedbackWidget() {
  const pathname = usePathname()
  const [state, setState] = useState<WidgetState>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('feedback_submitted')) {
      setPulse(true)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (score === null) return
    setState('submitting')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, comment: comment || undefined, page: pathname }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      localStorage.setItem('feedback_submitted', '1')
      setPulse(false)
      setState('success')
      setTimeout(() => {
        setState('idle')
        setScore(null)
        setComment('')
      }, 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('open'), 2000)
    }
  }, [score, comment, pathname])

  const handleClose = useCallback(() => {
    setState('idle')
    setScore(null)
    setComment('')
  }, [])

  if (state === 'idle') {
    return (
      <button
        onClick={() => setState('open')}
        className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg flex items-center justify-center transition-all ${pulse ? 'animate-pulse' : ''}`}
        aria-label="Give feedback"
        title="Give feedback"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4" role="dialog" aria-label="Feedback">
      {state === 'success' ? (
        <div className="text-center py-6">
          <p className="text-lg font-semibold text-green-400">Merci !</p>
          <p className="text-sm text-zinc-400 mt-1">Ton retour compte.</p>
        </div>
      ) : state === 'error' ? (
        <div className="text-center py-6">
          <p className="text-lg font-semibold text-red-400">Erreur</p>
          <p className="text-sm text-zinc-400 mt-1">Réessaie plus tard.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-200">Que penses-tu de MibeStats ?</h3>
            <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-300" aria-label="Close">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-1 mb-3">
            {SCORE_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
                  score === i
                    ? `${SCORE_COLORS[i]} text-white scale-110`
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                }`}
                aria-label={`Score ${label}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-zinc-600 mb-3 px-1">
            <span>Pas du tout</span>
            <span>Absolument</span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Un commentaire ? (optionnel)"
            maxLength={1000}
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-purple-500 mb-3"
          />

          <button
            onClick={handleSubmit}
            disabled={score === null || state === 'submitting'}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-lg py-2 transition-colors"
          >
            {state === 'submitting' ? 'Envoi...' : 'Envoyer'}
          </button>
        </>
      )}
    </div>
  )
}
