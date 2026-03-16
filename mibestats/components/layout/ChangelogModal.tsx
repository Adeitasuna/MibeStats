'use client'

import { useState, useEffect, useMemo } from 'react'

interface ChangelogEntry {
  version: string
  date: string
  summary: string
  changes: string[]
}

interface GroupedVersion {
  label: string
  date: string
  summaries: string[]
  changes: string[]
}

function groupByMinor(entries: ChangelogEntry[]): GroupedVersion[] {
  const map = new Map<string, GroupedVersion>()

  for (const entry of entries) {
    const parts = entry.version.split('.')
    const key = `${parts[0]}.${parts[1]}`

    if (!map.has(key)) {
      map.set(key, { label: key, date: entry.date, summaries: [], changes: [] })
    }

    const group = map.get(key)!
    // Keep the most recent date
    if (entry.date > group.date) group.date = entry.date
    group.summaries.push(entry.summary)
    group.changes.push(...entry.changes)
  }

  return Array.from(map.values())
}

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])

  useEffect(() => {
    fetch('/changelog.json')
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {})
  }, [])

  const grouped = useMemo(() => groupByMinor(entries), [entries])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0a0a0a',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: '0.5rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255,215,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span className="font-terminal" style={{ color: '#ffd700', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Changelog
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#555', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Grouped entries */}
        <div style={{ overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {grouped.map((group, i) => (
            <div key={group.label} style={{ marginBottom: i < grouped.length - 1 ? '1.25rem' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="font-terminal" style={{ color: '#ffd700', fontSize: '0.85rem', fontWeight: 700 }}>
                  v{group.label}
                </span>
                <span style={{ color: '#555', fontSize: '0.7rem' }}>
                  {group.date}
                </span>
              </div>
              {group.summaries.map((summary, j) => (
                <p key={j} style={{ color: '#ccc', fontSize: '0.8rem', margin: '0 0 0.2rem 0', fontWeight: 500 }}>
                  {summary}
                </p>
              ))}
              <ul style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.1rem', listStyle: 'none' }}>
                {group.changes.map((change, j) => (
                  <li key={j} style={{ color: '#888', fontSize: '0.7rem', lineHeight: 1.6, position: 'relative', paddingLeft: '0.1rem' }}>
                    <span style={{ position: 'absolute', left: '-0.9rem', color: '#ffd700' }}>›</span>
                    {change}
                  </li>
                ))}
              </ul>
              {i < grouped.length - 1 && (
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
