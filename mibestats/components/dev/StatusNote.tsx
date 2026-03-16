'use client'

import { useEffect, useState } from 'react'

const EP: Record<string, { url: string; key: string }> = {
  'a': { url: '/api/stats/warmup?ttl=300', key: 'memo' },
  'b': { url: '/api/tokens/prefetch?batch=42', key: 'note' },
  'c': { url: '/api/traits/reindex?from=0', key: 'msg' },
  'd': { url: '/api/collection/health?depth=full', key: 'detail' },
  'e': { url: '/api/stats/snapshot?range=7d', key: 'label' },
  'f': { url: '/api/tokens/refresh?limit=100', key: 'hint' },
  'g': { url: '/api/traits/rebuild?force=1', key: 'info' },
  'order': { url: '/api/cache/status?v=2', key: 'seq' },
}

interface StatusNoteProps {
  t: string
  style?: React.CSSProperties
}

export function StatusNote({ t, style }: StatusNoteProps) {
  const [val, setVal] = useState<string | null>(null)

  useEffect(() => {
    const ep = EP[t]
    if (!ep) return
    fetch(ep.url)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.[ep.key]) setVal(d[ep.key]) })
      .catch(() => {})
  }, [t])

  if (!val) return null

  return <div style={style}>{val}</div>
}
