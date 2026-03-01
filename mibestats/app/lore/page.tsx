import type { Metadata } from 'next'
import Image from 'next/image'

import {
  LORE_DOCUMENTS,
  OFFICIAL_SITE_PAGES,
  FBI_FUGITIVES,
  FRACTURE_STAGES,
} from '@/lib/lore-data'
import { FugitiveGrid } from '@/components/lore/FugitiveGrid'

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
        <p style={{ color: '#888', fontSize: '1rem', marginTop: '0.25rem' }}>
          Everything you need to know about the Mibera333 universe
        </p>
      </div>

      {/* ── Lore Documents — 7 compact blocks in 1 row ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Lore</h2>
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
                <svg width="16" height="16" style={{ color: '#58a6ff', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-terminal" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#58a6ff' }}>
                  {doc.title}
                </span>
              </div>
              {doc.description && (
                <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.4, margin: 0 }}>{doc.description}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ── Fractures — Alternating Timeline with Images ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Fractures — The Reveal Timeline</h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '0.5rem' }} />
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          10 soulbound ERC-721 collections marking each phase of Mibera&apos;s progressive reveal — example: Mibera #2474
        </p>

        <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative' }}>
          {FRACTURE_STAGES.map((stage, i) => {
            const isTop = i % 2 === 0
            const dateLabel = stage.date || 'TBD'
            const dateColor = stage.date ? '#ffd700' : '#555'
            const cardHeight = '220px'

            return (
              <div key={stage.phase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, position: 'relative' }}>
                {/* Top area — card OR date (opposite sides) */}
                <div style={{ height: cardHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%', padding: '0 0.15rem' }}>
                  {isTop ? (
                    <div className="card" style={{ padding: '0.35rem', width: '100%', maxWidth: '110px', textAlign: 'center' }}>
                      <p className="font-terminal" style={{ fontSize: '0.55rem', fontWeight: 600, color: '#888', margin: '0 0 0.15rem 0' }}>
                        Phase {stage.phase}
                      </p>
                      <div style={{ width: '80px', height: '80px', margin: '0 auto 0.2rem', borderRadius: '4px', overflow: 'hidden', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                          src={stage.imageUrl}
                          alt={stage.name}
                          width={80}
                          height={80}
                          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                          unoptimized
                        />
                      </div>
                      <p className="font-terminal" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ffd700', margin: '0 0 0.1rem 0', lineHeight: 1.2 }}>
                        {stage.name}
                      </p>
                      <p style={{ fontSize: '0.6rem', color: '#888', lineHeight: 1.2, margin: '0 0 0.15rem 0' }}>
                        {stage.description}
                      </p>
                      <a
                        href={`https://beratrail.io/address/${stage.contract}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-terminal"
                        style={{ fontSize: '0.6rem', color: '#58a6ff', textDecoration: 'none' }}
                        title={stage.contract}
                      >
                        {truncateAddress(stage.contract)}
                      </a>
                    </div>
                  ) : (
                    <span className="font-terminal" style={{ fontSize: '0.6rem', color: dateColor, whiteSpace: 'nowrap' }}>
                      {dateLabel}
                    </span>
                  )}
                </div>

                {/* Vertical connector (top) */}
                <div style={{ width: '2px', height: '0.4rem', background: '#ffd700' }} />

                {/* Phase dot + horizontal line */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Horizontal line segment */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: i === 0 ? '50%' : '-50%',
                    right: i === FRACTURE_STAGES.length - 1 ? '50%' : '-50%',
                    height: '2px',
                    background: '#ffd700',
                    transform: 'translateY(-50%)',
                  }} />
                  <div style={{
                    width: '1.8rem',
                    height: '1.8rem',
                    borderRadius: '50%',
                    background: '#0a0a0a',
                    border: '2px solid #ffd700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    <span className="font-terminal" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffd700' }}>
                      {stage.phase}
                    </span>
                  </div>
                </div>

                {/* Vertical connector (bottom) */}
                <div style={{ width: '2px', height: '0.4rem', background: '#ffd700' }} />

                {/* Bottom area — card OR date (opposite sides) */}
                <div style={{ height: cardHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%', padding: '0 0.15rem' }}>
                  {!isTop ? (
                    <div className="card" style={{ padding: '0.35rem', width: '100%', maxWidth: '110px', textAlign: 'center' }}>
                      <p className="font-terminal" style={{ fontSize: '0.55rem', fontWeight: 600, color: '#888', margin: '0 0 0.15rem 0' }}>
                        Phase {stage.phase}
                      </p>
                      <div style={{ width: '80px', height: '80px', margin: '0 auto 0.2rem', borderRadius: '4px', overflow: 'hidden', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                          src={stage.imageUrl}
                          alt={stage.name}
                          width={80}
                          height={80}
                          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                          unoptimized
                        />
                      </div>
                      <p className="font-terminal" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ffd700', margin: '0 0 0.1rem 0', lineHeight: 1.2 }}>
                        {stage.name}
                      </p>
                      <p style={{ fontSize: '0.6rem', color: '#888', lineHeight: 1.2, margin: '0 0 0.15rem 0' }}>
                        {stage.description}
                      </p>
                      <a
                        href={`https://beratrail.io/address/${stage.contract}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-terminal"
                        style={{ fontSize: '0.6rem', color: '#58a6ff', textDecoration: 'none' }}
                        title={stage.contract}
                      >
                        {truncateAddress(stage.contract)}
                      </a>
                    </div>
                  ) : (
                    <span className="font-terminal" style={{ fontSize: '0.6rem', color: dateColor, whiteSpace: 'nowrap' }}>
                      {dateLabel}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Official Site ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Official Site</h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '0.5rem' }} />
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Explore the Mibera darknet marketplace at{' '}
          <a href="https://mibera.0xhoneyjar.xyz" target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>
            mibera.0xhoneyjar.xyz
          </a>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
          {OFFICIAL_SITE_PAGES.map((page) => (
            <a
              key={page.label}
              href={page.url}
              target="_blank"
              rel="noreferrer"
              className="card"
              style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" style={{ color: '#58a6ff', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-terminal" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#58a6ff' }}>
                  {page.label}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.4, margin: 0 }}>
                {page.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ── FBI Fugitives ── */}
      <FugitiveGrid fugitives={FBI_FUGITIVES} />
    </div>
  )
}
