import type { Metadata } from 'next'
import Image from 'next/image'

import {
  LORE_DOCUMENTS,
  TOR_LINKS,
  FBI_FUGITIVES,
  FRACTURE_STAGES,
} from '@/lib/lore-data'

export const metadata: Metadata = {
  title: 'MibeLore',
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function LorePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h1 className="section-title" style={{ fontSize: '1.8rem' }}>MibeLore</h1>
        <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Everything you need to know about the Mibera333 universe
        </p>
      </div>

      {/* ── Lore Documents — 7 compact blocks in 1 row ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Lore</h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {LORE_DOCUMENTS.map((doc) => (
            <a
              key={doc.title}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="card"
              style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <svg width="14" height="14" style={{ color: '#ffd700', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-terminal" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ffd700' }}>
                  {doc.title}
                </span>
              </div>
              {doc.description && (
                <p style={{ fontSize: '0.6rem', color: '#888', lineHeight: 1.4, margin: 0 }}>{doc.description}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ── Fractures — Horizontal Timeline ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Fractures — The Reveal Timeline</h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '0.5rem' }} />
        <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1rem' }}>
          10 soulbound ERC-721 collections marking each phase of Mibera&apos;s progressive reveal
        </p>

        {/* Horizontal scrollable timeline */}
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute',
              top: '1.1rem',
              left: '1.5rem',
              right: '1.5rem',
              height: '2px',
              background: 'linear-gradient(90deg, #ffd700, #ffd700 80%, #2a2a2a)',
            }} />

            {FRACTURE_STAGES.map((stage, i) => (
              <div key={stage.phase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px', flexShrink: 0, position: 'relative' }}>
                {/* Phase dot */}
                <div style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: '50%',
                  background: '#0a0a0a',
                  border: '2px solid #ffd700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}>
                  <span className="font-terminal" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffd700' }}>
                    {stage.phase}
                  </span>
                </div>

                {/* Vertical connector */}
                <div style={{ width: '2px', height: '0.5rem', background: '#2a2a2a' }} />

                {/* Card */}
                <div className="card" style={{ padding: '0.5rem', width: '120px', textAlign: 'center' }}>
                  <p className="font-terminal" style={{ fontSize: '0.65rem', fontWeight: 600, color: '#fff', margin: '0 0 0.2rem 0' }}>
                    {stage.name}
                  </p>
                  <p style={{ fontSize: '0.55rem', color: '#888', lineHeight: 1.3, margin: '0 0 0.3rem 0' }}>
                    {stage.description}
                  </p>
                  <a
                    href={`https://beratrail.io/address/${stage.contract}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-terminal"
                    style={{ fontSize: '0.55rem', color: '#58a6ff', textDecoration: 'none' }}
                    title={stage.contract}
                  >
                    {truncateAddress(stage.contract)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── On TOR ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>On TOR</h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
          {TOR_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="card"
              style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" style={{ color: '#58a6ff', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-terminal" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#58a6ff' }}>
                  {link.label}
                </span>
              </div>
              <p style={{ fontSize: '0.65rem', color: '#888', lineHeight: 1.4, margin: 0 }}>
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ── FBI Top 12 Fugitives ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>
          Searched by the FBI: Twitter TOP 12 fugitives
        </h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '0.5rem' }} />
        <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '1rem' }}>
          The most wanted accounts in the Mibera ecosystem
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
          {FBI_FUGITIVES.map((fugitive) => (
            <a
              key={fugitive.handle}
              href={`https://x.com/${fugitive.handle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="card"
              style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
            >
              {/* Twitter PFP */}
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                {fugitive.avatarUrl ? (
                  <Image
                    src={fugitive.avatarUrl}
                    alt={fugitive.displayName}
                    width={48}
                    height={48}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    unoptimized
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" style={{ color: '#555' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="font-terminal" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                  {fugitive.displayName}
                </p>
                <p className="font-terminal" style={{ fontSize: '0.65rem', color: '#58a6ff', margin: '0.1rem 0' }}>
                  {fugitive.handle}
                </p>
                <p style={{ fontSize: '0.6rem', color: '#888', lineHeight: 1.3, margin: 0 }}>
                  {fugitive.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
