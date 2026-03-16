'use client'

import { useState, useCallback } from 'react'

interface Entry {
  code: string
  status: string
  solvedAt: string | null
  wallet: string | null
  pseudo: string | null
  ip: string | null
  registeredAt: string | null
}

interface Attempt {
  ip: string | null
  createdAt: string
}

interface Stats {
  totalSolved: number
  totalClaimed: number
  totalAttempts: number
}

export default function InternalPage() {
  const [token, setToken] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [showAttempts, setShowAttempts] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (t: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/internal/events', { headers: { Authorization: `Bearer ${t}` } })
      if (res.status === 401) {
        setError('Invalid token')
        setAuthenticated(false)
        return
      }
      const data = await res.json()
      setEntries(data.entries)
      setAttempts(data.attempts)
      setStats(data.stats)
      setAuthenticated(true)
    } catch {
      setError('Connection failed')
    }
    setLoading(false)
  }, [])

  const handleLogin = useCallback(() => {
    if (!token.trim()) return
    fetchData(token.trim())
  }, [token, fetchData])

  const fmt = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('fr-FR')
  }

  if (!authenticated) {
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
          maxWidth: '350px',
          width: '100%',
          padding: '2rem',
          border: '1px solid #222',
          borderRadius: '0.5rem',
        }}>
          <div style={{ color: '#555', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            Authentication required
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Token"
              style={{
                flex: 1,
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '0.25rem',
                padding: '0.5rem 0.75rem',
                color: '#fff',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={handleLogin}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #333',
                borderRadius: '0.25rem',
                color: '#888',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Go
            </button>
          </div>
          {error && (
            <div style={{ color: '#f85149', fontSize: '0.7rem', marginTop: '0.75rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: 'var(--font-share-tech-mono), monospace',
      padding: '1.5rem',
      color: '#ccc',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ color: '#0f0', fontSize: '0.8rem' }}>
              Solved: <strong>{stats.totalSolved}</strong>
            </div>
            <div style={{ color: '#ffd700', fontSize: '0.8rem' }}>
              Claimed: <strong>{stats.totalClaimed}</strong>
            </div>
            <div style={{ color: '#f85149', fontSize: '0.8rem' }}>
              Failed attempts: <strong>{stats.totalAttempts}</strong>
            </div>
            <button
              onClick={() => fetchData(token)}
              style={{ marginLeft: 'auto', color: '#555', background: 'none', border: '1px solid #333', borderRadius: '0.25rem', padding: '0.2rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Refresh
            </button>
          </div>
        )}

        {loading && <div style={{ color: '#555', fontSize: '0.8rem' }}>Loading...</div>}

        {/* Winners table */}
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Solved</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Pseudo</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Wallet</th>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.code} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '0.4rem 0.5rem', color: '#ffd700', fontFamily: 'monospace' }}>
                    {e.code}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', color: e.status === 'claimed' ? '#0f0' : '#f0883e', fontWeight: 600 }}>
                    {e.status}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', color: '#555', whiteSpace: 'nowrap' }}>
                    {fmt(e.solvedAt)}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', color: '#ccc' }}>
                    {e.pseudo ?? '—'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', color: '#0f0', fontFamily: 'monospace', fontSize: '0.6rem' }}>
                    {e.wallet ?? '—'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', color: '#333', fontSize: '0.6rem' }}>
                    {e.ip ?? '—'}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#333' }}>
                    No entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Failed attempts toggle */}
        {attempts.length > 0 && (
          <div>
            <button
              onClick={() => setShowAttempts(!showAttempts)}
              style={{ color: '#555', background: 'none', border: '1px solid #222', borderRadius: '0.25rem', padding: '0.3rem 0.8rem', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.75rem' }}
            >
              {showAttempts ? 'Hide' : 'Show'} failed attempts ({attempts.length})
            </button>
            {showAttempts && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.65rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#333' }}>
                      <th style={{ padding: '0.4rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '0.4rem', textAlign: 'left' }}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #0a0a0a' }}>
                        <td style={{ padding: '0.3rem 0.4rem', color: '#333' }}>{fmt(a.createdAt)}</td>
                        <td style={{ padding: '0.3rem 0.4rem', color: '#222' }}>{a.ip ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
