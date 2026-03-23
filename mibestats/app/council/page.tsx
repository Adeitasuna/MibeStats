'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface EggEntry {
  code: string
  status: 'solved' | 'claimed'
  solvedAt: string | null
  wallet: string | null
  pseudo: string | null
  ip: string | null
  registeredAt: string | null
}

interface EggStats { totalSolved: number; totalClaimed: number; totalAttempts: number }
interface EggsData { entries: EggEntry[]; attempts: { ip: string | null; createdAt: string }[]; stats: EggStats }
interface FeedbackEntry { id: string; score: number; page: string; wallet: string | null; visitorId: string | null; createdAt: string }
interface BugEntry {
  id: string; description: string; page: string; createdAt: string; viewport: string | null
  status: string; gitHash: string | null; screenshotB64: string | null; consoleErrors: string | null
  wallet: string | null; visitorId: string | null; userAgent: string | null
}

interface StatsData {
  nps: { score: number; avgScore: number; total: number; promoters: number; passives: number; detractors: number; recent: FeedbackEntry[] }
  bugs: { total: number; recent: BugEntry[] }
  daily: { feedback: number; bugs: number }
}

interface MetricEntry { x: string; y: number }
interface PageviewEntry { x: string; y: number }
interface AnalyticsData {
  period: string
  stats: { pageviews: { value: number }; visitors: { value: number }; visits: { value: number }; bounces: { value: number }; totaltime: { value: number } }
  pageviews: { pageviews: PageviewEntry[]; sessions: PageviewEntry[] }
  pages: MetricEntry[]
  referrers: MetricEntry[]
  browsers: MetricEntry[]
  os: MetricEntry[]
  countries: MetricEntry[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

function truncAddr(addr: string | null) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export default function CouncilPage() {
  const [apiKey, setApiKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'eggs' | 'feedback' | 'bugs' | 'analytics'>('eggs')
  const [eggs, setEggs] = useState<EggsData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('council_key')
    if (saved) { setApiKey(saved); setAuthed(true) }
  }, [])

  const fetchAnalytics = useCallback(async (key: string, period: string) => {
    try {
      const res = await fetch(`/api/internal/analytics?period=${period}`, { headers: { 'x-api-key': key } })
      if (res.ok) setAnalytics(await res.json())
    } catch { /* analytics is optional */ }
  }, [])

  const fetchData = useCallback(async (key: string) => {
    setLoading(true); setError('')
    try {
      const [eggsRes, statsRes] = await Promise.all([
        fetch('/api/internal/events', { headers: { Authorization: `Bearer ${key}` } }),
        fetch('/api/internal/stats', { headers: { 'x-api-key': key } }),
      ])
      if (eggsRes.status === 401 || statsRes.status === 401) {
        setError('Invalid passphrase'); setAuthed(false); sessionStorage.removeItem('council_key'); return
      }
      const [eggsData, statsData] = await Promise.all([
        eggsRes.ok ? eggsRes.json() : null, statsRes.ok ? statsRes.json() : null,
      ])
      setEggs(eggsData); setStats(statsData); setAuthed(true)
      sessionStorage.setItem('council_key', key)
      fetchAnalytics(key, analyticsPeriod)
    } catch { setError('Connection failed') }
    finally { setLoading(false) }
  }, [fetchAnalytics, analyticsPeriod])

  useEffect(() => { if (authed && apiKey) fetchData(apiKey) }, [authed, apiKey, fetchData])

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (apiKey.trim()) fetchData(apiKey) }
  const handleLogout = () => { setAuthed(false); setApiKey(''); setEggs(null); setStats(null); setAnalytics(null); sessionStorage.removeItem('council_key') }

  // ─── Login ──────────────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="council-login">
        <form onSubmit={handleLogin} className="card council-login-box">
          <h1 className="section-title" style={{ textAlign: 'center', fontSize: '1.5rem' }}>High Council</h1>
          <p className="chapo-h1" style={{ textAlign: 'center' }}>Restricted access</p>
          <input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setError('') }}
            placeholder="Passphrase" autoFocus className="council-input" />
          {error && <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="wallet-btn" style={{ width: '100%', textAlign: 'center' }}>
            {loading ? 'Authenticating...' : 'Access'}
          </button>
        </form>
      </div>
    )
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  return (
    <div className="council-page">
      {/* Header */}
      <div className="council-header">
        <h1 className="section-title">High Council</h1>
        <div className="council-actions">
          <button onClick={() => fetchData(apiKey)} disabled={loading} className="btn-ghost">
            {loading ? '...' : 'Refresh'}
          </button>
          <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--accent-red)' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Row 1 */}
      <div className="council-grid">
        <div className="stat-card stat-card--gold"><span className="card-title-upper">Eggs Solved</span><span className="council-stat-value">{eggs?.stats.totalSolved ?? 0}</span></div>
        <div className="stat-card stat-card--gold"><span className="card-title-upper">Eggs Claimed</span><span className="council-stat-value">{eggs?.stats.totalClaimed ?? 0}</span></div>
        <div className="stat-card"><span className="card-title-upper">Failed Attempts</span><span className="council-stat-value">{eggs?.stats.totalAttempts ?? 0}</span></div>
        <div className="stat-card"><span className="card-title-upper">NPS Score</span><span className="council-stat-value">{stats?.nps.score ?? '—'}</span></div>
      </div>

      {/* Stats Row 2 */}
      <div className="council-grid">
        <div className="stat-card"><span className="card-title-upper">Total Feedback</span><span className="council-stat-value">{stats?.nps.total ?? 0}</span></div>
        <div className="stat-card"><span className="card-title-upper">Avg Score</span><span className="council-stat-value">{stats?.nps.avgScore != null ? `${stats.nps.avgScore}/10` : '—'}</span></div>
        <div className="stat-card"><span className="card-title-upper">Bug Reports</span><span className="council-stat-value">{stats?.bugs.total ?? 0}</span></div>
        <div className="stat-card"><span className="card-title-upper">Last 7 days</span><span className="council-stat-value">{stats?.daily.feedback ?? 0}f / {stats?.daily.bugs ?? 0}b</span></div>
      </div>

      {/* NPS Bar */}
      {stats && stats.nps.total > 0 && (
        <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
          <span className="card-title-upper" style={{ marginBottom: '0.5rem', display: 'block' }}>NPS Distribution</span>
          <div className="council-nps-bar">
            <div className="council-nps-promoters" style={{ width: `${(stats.nps.promoters / stats.nps.total) * 100}%` }} />
            <div className="council-nps-passives" style={{ width: `${(stats.nps.passives / stats.nps.total) * 100}%` }} />
            <div className="council-nps-detractors" style={{ width: `${(stats.nps.detractors / stats.nps.total) * 100}%` }} />
          </div>
          <div className="council-nps-legend">
            <span style={{ color: 'var(--accent-green)' }}>Promoters {stats.nps.promoters}</span>
            <span style={{ color: '#facc15' }}>Passives {stats.nps.passives}</span>
            <span style={{ color: 'var(--accent-red)' }}>Detractors {stats.nps.detractors}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="council-tabs">
        {(['eggs', 'feedback', 'bugs', 'analytics'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`council-tab ${tab === t ? 'council-tab--active' : ''}`}>
            {t === 'eggs' ? `Eggs (${eggs?.entries.length ?? 0})` :
             t === 'feedback' ? `Feedback (${stats?.nps.total ?? 0})` :
             t === 'bugs' ? `Bugs (${stats?.bugs.total ?? 0})` :
             'Analytics'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'eggs' && <EggsTab eggs={eggs} apiKey={apiKey} onRefresh={() => fetchData(apiKey)} />}
      {tab === 'feedback' && <FeedbackTab stats={stats} apiKey={apiKey} onRefresh={() => fetchData(apiKey)} />}
      {tab === 'bugs' && <BugsTab stats={stats} apiKey={apiKey} onRefresh={() => fetchData(apiKey)} />}
      {tab === 'analytics' && <AnalyticsTab data={analytics} apiKey={apiKey} period={analyticsPeriod}
        onPeriodChange={(p) => { setAnalyticsPeriod(p); fetchAnalytics(apiKey, p) }} />}
    </div>
  )
}

// ─── Tabs ───────────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="council-copy-btn" title="Copy"
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

function EggsTab({ eggs, apiKey, onRefresh }: { eggs: EggsData | null; apiKey: string; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const handleDelete = async (code: string) => {
    setDeleting(code)
    try {
      const res = await fetch(`/api/internal/events?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (res.ok) onRefresh()
    } finally {
      setDeleting(null)
      setConfirm(null)
    }
  }

  if (!eggs) return <p className="council-empty">Loading...</p>
  return (
    <div>
      <div className="table-responsive">
        <table className="council-table">
          <thead>
            <tr>
              <th>Code</th><th>Status</th><th>Solved</th><th>Pseudo</th><th>Wallet</th><th>Claimed</th><th></th>
            </tr>
          </thead>
          <tbody>
            {eggs.entries.map((e) => (
              <tr key={e.code}>
                <td className="font-terminal" style={{ fontSize: '0.7rem' }}>{e.code}</td>
                <td>
                  <span className={e.status === 'claimed' ? 'badge-grail' : 'council-badge-pending'}>
                    {e.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{fmtDate(e.solvedAt)}</td>
                <td>
                  {e.pseudo ? (
                    <span className="council-copiable">
                      {e.pseudo} <CopyBtn text={e.pseudo} />
                    </span>
                  ) : '—'}
                </td>
                <td className="font-terminal" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} data-no-capture>
                  {e.wallet ? (
                    <span className="council-copiable">
                      {truncAddr(e.wallet)} <CopyBtn text={e.wallet} />
                    </span>
                  ) : '—'}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{fmtDate(e.registeredAt)}</td>
                <td>
                  {confirm === e.code ? (
                    <span className="council-confirm-delete">
                      <button onClick={() => handleDelete(e.code)} disabled={deleting === e.code}
                        className="council-delete-yes">
                        {deleting === e.code ? '...' : 'Yes'}
                      </button>
                      <button onClick={() => setConfirm(null)} className="council-delete-no">No</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirm(e.code)} className="council-delete-btn" title="Delete entry">
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {eggs.entries.length === 0 && (
              <tr><td colSpan={7} className="council-empty">No eggs solved yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {eggs.attempts.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 className="separator" style={{ fontSize: '1rem' }}>Recent Attempts ({eggs.attempts.length})</h3>
          <div className="council-grid">
            {eggs.attempts.slice(0, 20).map((a, i) => (
              <div key={i} className="stat-card font-terminal" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {a.ip ?? '?'} — {fmtDate(a.createdAt)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function scoreColor(s: number) {
  if (s >= 5) return 'var(--accent-green)'
  if (s >= 3) return '#facc15'
  return 'var(--accent-red)'
}

function scoreLabel(s: number) {
  if (s >= 5) return 'GOOD'
  if (s >= 3) return 'FINE'
  return 'BAD'
}

function FeedbackTab({ stats, apiKey, onRefresh }: { stats: StatsData | null; apiKey: string; onRefresh: () => void }) {
  const [confirm, setConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/internal/feedback?id=${id}`, { method: 'DELETE', headers: { 'x-api-key': apiKey } })
      onRefresh()
    } finally { setDeleting(null); setConfirm(null) }
  }

  if (!stats) return <p className="council-empty">Loading...</p>
  return (
    <div className="table-responsive">
      <table className="council-table">
        <thead><tr><th>Date</th><th>Page</th><th>Score</th><th>User</th><th>MibeID</th><th></th></tr></thead>
        <tbody>
          {stats.nps.recent.map((f) => (
            <tr key={f.id}>
              <td style={{ color: 'var(--text-secondary)' }}>{fmtDate(f.createdAt)}</td>
              <td className="font-terminal" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.page}</td>
              <td style={{ fontWeight: 700, color: scoreColor(f.score) }}>
                {f.score} — {scoreLabel(f.score)}
              </td>
              <td className="font-terminal" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} data-no-capture>
                {f.wallet ? truncAddr(f.wallet) : '—'}
              </td>
              <td className="font-terminal" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {f.visitorId ?? '—'}
              </td>
              <td>
                {confirm === f.id ? (
                  <span className="council-confirm-delete">
                    <button onClick={() => handleDelete(f.id)} disabled={deleting === f.id} className="council-delete-yes">
                      {deleting === f.id ? '...' : 'Yes'}
                    </button>
                    <button onClick={() => setConfirm(null)} className="council-delete-no">No</button>
                  </span>
                ) : (
                  <button onClick={() => setConfirm(f.id)} className="council-delete-btn" title="Delete">✕</button>
                )}
              </td>
            </tr>
          ))}
          {stats.nps.recent.length === 0 && (
            <tr><td colSpan={6} className="council-empty">No feedback yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const CAT_ICONS: Record<string, string> = {
  'Wrong data': '⚡', 'Display issue': '👁', 'Slow / stuck': '🐌', 'Feature idea': '💡', 'Other': '☠',
}

const ALL_CATS = ['All', 'Wrong data', 'Display issue', 'Slow / stuck', 'Feature idea', 'Other']

function extractCategory(desc: string): { category: string; text: string } {
  const match = desc.match(/^\[([^\]]+)\]\s*(.*)$/)
  if (match) return { category: match[1], text: match[2] }
  return { category: 'Other', text: desc }
}

/** Simple word-overlap similarity (Jaccard index) */
function similarity(a: string, b: string): number {
  const wordsA = a.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  const wordsB = b.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  if (wordsA.length === 0 || wordsB.length === 0) return 0
  const setB = new Set(wordsB)
  let inter = 0
  for (let i = 0; i < wordsA.length; i++) if (setB.has(wordsA[i])) inter++
  const union = new Set([...wordsA, ...wordsB]).size
  return inter / union
}

function exportCSV(bugs: BugEntry[]) {
  const header = 'Date,Category,Description,Page,Viewport,User,MibeID\n'
  const rows = bugs.map((b) => {
    const { category, text } = extractCategory(b.description)
    return [
      b.createdAt, category, `"${text.replace(/"/g, '""')}"`,
      b.page, b.viewport ?? '', b.wallet ?? '', b.visitorId ?? '',
    ].join(',')
  }).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `mibestats-bugs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

/** Cluster bugs by similarity within same category. Returns cluster ID per bug. */
function computeClusters(bugs: { id: string; category: string; text: string }[]): Map<string, number> {
  const clusters = new Map<string, number>()
  let nextCluster = 1

  for (let i = 0; i < bugs.length; i++) {
    if (clusters.has(bugs[i].id)) continue
    // Find all bugs similar to this one in the same category
    const group = [i]
    for (let j = i + 1; j < bugs.length; j++) {
      if (bugs[j].category !== bugs[i].category) continue
      if (clusters.has(bugs[j].id)) continue
      if (similarity(bugs[i].text, bugs[j].text) > 0.4) group.push(j)
    }
    if (group.length > 1) {
      const cid = nextCluster++
      for (const idx of group) clusters.set(bugs[idx].id, cid)
    }
  }
  return clusters
}

function parseUA(ua: string | null): string {
  if (!ua) return '—'
  let browser = 'Unknown'
  let os = 'Unknown'
  // Browser
  if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'
  // OS
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  return `${browser} / ${os}`
}

function consoleErrorCount(raw: string | null): number {
  if (!raw) return 0
  try { return (JSON.parse(raw) as string[]).length } catch { return 0 }
}

function BugsTab({ stats, apiKey, onRefresh }: { stats: StatsData | null; apiKey: string; onRefresh: () => void }) {
  const [catFilter, setCatFilter] = useState('All')
  const [pageFilter, setPageFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ id: string; action: 'delete' | 'resolve' } | null>(null)
  const [acting, setActing] = useState(false)

  const handleAction = async (id: string, action: 'delete' | 'resolve') => {
    setActing(true)
    try {
      if (action === 'delete') {
        await fetch(`/api/internal/bugs?id=${id}`, { method: 'DELETE', headers: { 'x-api-key': apiKey } })
      } else {
        await fetch(`/api/internal/bugs?id=${id}&status=resolved`, { method: 'PATCH', headers: { 'x-api-key': apiKey } })
      }
      onRefresh()
    } finally { setActing(false); setConfirm(null) }
  }

  if (!stats) return <p className="council-empty">Loading...</p>

  const parsed = stats.bugs.recent.map((b) => {
    const { category, text } = extractCategory(b.description)
    return { ...b, category, text }
  })

  // Unique pages for filter dropdown
  const uniquePages = ['All', ...Array.from(new Set(parsed.map(b => b.page))).sort()]

  const filtered = parsed.filter((b) => {
    if (catFilter !== 'All' && b.category !== catFilter) return false
    if (pageFilter !== 'All' && b.page !== pageFilter) return false
    if (search && !b.text.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const clusters = computeClusters(filtered)
  const clusterCount = new Set(Array.from(clusters.values())).size

  // Color palette for clusters
  const clusterColors = ['#f87171', '#fb923c', '#a78bfa', '#38bdf8', '#4ade80', '#facc15', '#f472b6', '#34d399']

  return (
    <div>
      {/* Filters */}
      <div className="council-filters">
        <div className="council-filter-group">
          {ALL_CATS.map((cat) => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`council-filter-btn ${catFilter === cat ? 'council-filter-btn--active' : ''}`}>
              {cat !== 'All' && (CAT_ICONS[cat] ?? '')} {cat}
              {cat !== 'All' && ` (${parsed.filter(b => b.category === cat).length})`}
            </button>
          ))}
        </div>
        <div className="council-filter-row">
          <select value={pageFilter} onChange={(e) => setPageFilter(e.target.value)} className="council-select">
            {uniquePages.map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'All pages' : p}</option>
            ))}
          </select>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description..." className="council-search" />
          <button onClick={() => exportCSV(filtered)} className="btn-ghost" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        {clusterCount > 0 && ` · ${clusterCount} similar group${clusterCount !== 1 ? 's' : ''} detected`}
        {` · ${filtered.filter(b => b.status === 'open').length} open`}
      </p>

      {/* Table */}
      <div className="table-responsive">
        <table className="council-table">
          <thead>
            <tr>
              <th>Date</th><th>Cat.</th><th>Description</th><th>Page</th><th>Status</th>
              <th title="Console errors">Err.</th><th>User</th><th title="Similarity cluster">Sim.</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const cluster = clusters.get(b.id)
              const errCount = consoleErrorCount(b.consoleErrors)
              const isExpanded = expanded === b.id
              const isConfirm = confirm?.id === b.id

              return (
                <tr key={b.id} onClick={() => { if (!isConfirm) setExpanded(isExpanded ? null : b.id) }}
                  style={{ cursor: 'pointer', background: isExpanded ? 'var(--bg-hover)' : undefined,
                    opacity: b.status === 'resolved' ? 0.5 : 1 }}>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmtDate(b.createdAt)}</td>
                  <td><span className="council-bug-cat">{CAT_ICONS[b.category] ?? '☠'}</span></td>
                  <td>
                    <div style={{ maxWidth: '300px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                        {b.text}
                      </div>
                      {isExpanded && (
                        <div className="council-bug-detail">
                          {b.screenshotB64 && (
                            <div className="council-bug-screenshot">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`data:image/png;base64,${b.screenshotB64}`} alt="Screenshot" />
                            </div>
                          )}
                          {b.consoleErrors && (
                            <div className="council-bug-console">
                              <span className="card-title-upper" style={{ marginBottom: '4px', display: 'block' }}>Console Errors ({errCount})</span>
                              {(JSON.parse(b.consoleErrors) as string[]).map((e, i) => (
                                <div key={i} className="council-console-line">{e}</div>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Browser: {parseUA(b.userAgent)} · Viewport: {b.viewport ?? '—'} · Build: {b.gitHash ?? '—'}
                            {b.visitorId && ` · MibeID: ${b.visitorId}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="font-terminal" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{b.page}</td>
                  <td>
                    <span className={b.status === 'resolved' ? 'badge-grail' : 'council-badge-pending'}
                      style={b.status === 'open' ? { background: 'rgba(248,81,73,0.15)', color: 'var(--accent-red)', borderColor: 'rgba(248,81,73,0.3)' } : undefined}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {errCount > 0 && (
                      <span className="council-err-badge" title={`${errCount} console error${errCount > 1 ? 's' : ''}`}>
                        {errCount}
                      </span>
                    )}
                  </td>
                  <td className="font-terminal" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }} data-no-capture>
                    {b.wallet ? truncAddr(b.wallet) : '—'}
                  </td>
                  <td>
                    {cluster && (
                      <span className="council-cluster-badge"
                        style={{ borderColor: clusterColors[(cluster - 1) % clusterColors.length], color: clusterColors[(cluster - 1) % clusterColors.length] }}
                        title={`Similar group #${cluster}`}>
                        G{cluster}
                      </span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {isConfirm ? (
                      <span className="council-confirm-delete">
                        <button onClick={() => handleAction(b.id, confirm.action)} disabled={acting}
                          className={confirm.action === 'delete' ? 'council-delete-yes' : 'council-resolve-yes'}>
                          {acting ? '...' : confirm.action === 'delete' ? 'Del' : 'Ok'}
                        </button>
                        <button onClick={() => setConfirm(null)} className="council-delete-no">No</button>
                      </span>
                    ) : (
                      <span className="council-action-group">
                        {b.status === 'open' && (
                          <button onClick={() => setConfirm({ id: b.id, action: 'resolve' })}
                            className="council-resolve-btn" title="Mark resolved">✓</button>
                        )}
                        <button onClick={() => setConfirm({ id: b.id, action: 'delete' })}
                          className="council-delete-btn" title="Delete">✕</button>
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="council-empty">No bug reports match</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

const PERIODS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

function AnalyticsTab({ data, period, onPeriodChange }: {
  data: AnalyticsData | null; apiKey?: string; period: string
  onPeriodChange: (p: string) => void
}) {
  if (!data) return <p className="council-empty">Loading analytics... (requires UMAMI_API_KEY)</p>

  const s = data.stats
  const avgTime = s.visits?.value > 0
    ? Math.round((s.totaltime?.value ?? 0) / s.visits.value / 1000)
    : 0
  const bounceRate = s.visits?.value > 0
    ? Math.round(((s.bounces?.value ?? 0) / s.visits.value) * 100)
    : 0

  const pvData = data.pageviews?.pageviews ?? []
  const sessData = data.pageviews?.sessions ?? []
  const maxPv = Math.max(1, ...pvData.map((d) => d.y))

  return (
    <div>
      {/* Period selector */}
      <div className="council-filter-group" style={{ marginBottom: '1rem' }}>
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => onPeriodChange(p.value)}
            className={`council-filter-btn ${period === p.value ? 'council-filter-btn--active' : ''}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Overview cards */}
      <div className="council-grid">
        <div className="stat-card stat-card--gold">
          <span className="card-title-upper">Pageviews</span>
          <span className="council-stat-value">{s.pageviews?.value?.toLocaleString() ?? 0}</span>
        </div>
        <div className="stat-card stat-card--gold">
          <span className="card-title-upper">Unique Visitors</span>
          <span className="council-stat-value">{s.visitors?.value?.toLocaleString() ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="card-title-upper">Sessions</span>
          <span className="council-stat-value">{s.visits?.value?.toLocaleString() ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="card-title-upper">Bounce Rate</span>
          <span className="council-stat-value">{bounceRate}%</span>
        </div>
        <div className="stat-card">
          <span className="card-title-upper">Avg. Visit</span>
          <span className="council-stat-value">{avgTime}s</span>
        </div>
      </div>

      {/* Pageviews chart (CSS bar chart) */}
      {pvData.length > 0 && (
        <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
          <span className="card-title-upper" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Pageviews &amp; Sessions
          </span>
          <div className="council-analytics-chart">
            {pvData.map((d, i) => {
              const sess = sessData[i]?.y ?? 0
              const label = period === '24h'
                ? new Date(d.x).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : new Date(d.x).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
              return (
                <div key={d.x} className="council-chart-col" title={`${label}: ${d.y} views, ${sess} sessions`}>
                  <div className="council-chart-bars">
                    <div className="council-chart-bar council-chart-bar--pv"
                      style={{ height: `${(d.y / maxPv) * 100}%` }} />
                    <div className="council-chart-bar council-chart-bar--sess"
                      style={{ height: `${(sess / maxPv) * 100}%` }} />
                  </div>
                  <span className="council-chart-label">{label}</span>
                </div>
              )
            })}
          </div>
          <div className="council-nps-legend" style={{ marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--accent-gold)' }}>Pageviews</span>
            <span style={{ color: 'var(--accent-green)' }}>Sessions</span>
          </div>
        </div>
      )}

      {/* Metrics tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <MetricTable title="Top Pages" data={data.pages} />
        <MetricTable title="Referrers" data={data.referrers} />
        <MetricTable title="Browsers" data={data.browsers} />
        <MetricTable title="OS" data={data.os} />
        <MetricTable title="Countries" data={data.countries} />
      </div>
    </div>
  )
}

function MetricTable({ title, data }: { title: string; data: MetricEntry[] }) {
  if (!data || data.length === 0) return null
  const max = Math.max(1, ...data.map((d) => d.y))
  return (
    <div className="card" style={{ padding: '0.75rem' }}>
      <span className="card-title-upper" style={{ marginBottom: '0.5rem', display: 'block' }}>{title}</span>
      <div className="council-metric-list">
        {data.map((d) => (
          <div key={d.x || '(direct)'} className="council-metric-row">
            <span className="council-metric-name" title={d.x}>{d.x || '(direct)'}</span>
            <div className="council-metric-bar-bg">
              <div className="council-metric-bar-fill" style={{ width: `${(d.y / max) * 100}%` }} />
            </div>
            <span className="council-metric-value">{d.y}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
