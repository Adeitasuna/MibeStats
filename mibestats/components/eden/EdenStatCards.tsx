'use client'

export function GoldCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">{label}</span>
      <div className="stat-card stat-card--gold">
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{value}</span>
      </div>
    </div>
  )
}

export function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="card-title-upper">{label}</span>
      <div className="stat-card">
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{value}</span>
      </div>
    </div>
  )
}
