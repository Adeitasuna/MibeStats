import type { Metadata } from 'next'
import Image from 'next/image'

import {
  LORE_DOCUMENTS,
  OFFICIAL_SITE_PAGES,
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

        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 'max-content', position: 'relative' }}>
            {FRACTURE_STAGES.map((stage, i) => {
              const isTop = i % 2 === 0
              const cardHeight = '240px'

              return (
                <div key={stage.phase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px', flexShrink: 0, position: 'relative' }}>
                  {/* Top card area */}
                  <div style={{ height: cardHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    {isTop && (
                      <div className="card" style={{ padding: '0.5rem', width: '140px', textAlign: 'center' }}>
                        <div style={{ width: '110px', height: '110px', margin: '0 auto 0.3rem', borderRadius: '4px', overflow: 'hidden', background: '#1a1a1a' }}>
                          <Image
                            src={stage.imageUrl}
                            alt={stage.name}
                            width={110}
                            height={110}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            unoptimized
                          />
                        </div>
                        <p className="font-terminal" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: '0 0 0.15rem 0' }}>
                          {stage.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.3, margin: '0 0 0.2rem 0' }}>
                          {stage.description}
                        </p>
                        <a
                          href={`https://beratrail.io/address/${stage.contract}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-terminal"
                          style={{ fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none' }}
                          title={stage.contract}
                        >
                          {truncateAddress(stage.contract)}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Vertical connector (top) */}
                  <div style={{ width: '2px', height: '0.5rem', background: isTop ? '#ffd700' : 'transparent' }} />

                  {/* Phase dot + horizontal line */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Horizontal line segment */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: i === 0 ? '50%' : '-75px',
                      right: i === FRACTURE_STAGES.length - 1 ? '50%' : '-75px',
                      height: '2px',
                      background: '#ffd700',
                      transform: 'translateY(-50%)',
                    }} />
                    <div style={{
                      width: '2.2rem',
                      height: '2.2rem',
                      borderRadius: '50%',
                      background: '#0a0a0a',
                      border: '2px solid #ffd700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 2,
                    }}>
                      <span className="font-terminal" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffd700' }}>
                        {stage.phase}
                      </span>
                    </div>
                  </div>

                  {/* Vertical connector (bottom) */}
                  <div style={{ width: '2px', height: '0.5rem', background: !isTop ? '#ffd700' : 'transparent' }} />

                  {/* Bottom card area */}
                  <div style={{ height: cardHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    {!isTop && (
                      <div className="card" style={{ padding: '0.5rem', width: '140px', textAlign: 'center' }}>
                        <div style={{ width: '110px', height: '110px', margin: '0 auto 0.3rem', borderRadius: '4px', overflow: 'hidden', background: '#1a1a1a' }}>
                          <Image
                            src={stage.imageUrl}
                            alt={stage.name}
                            width={110}
                            height={110}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            unoptimized
                          />
                        </div>
                        <p className="font-terminal" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: '0 0 0.15rem 0' }}>
                          {stage.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.3, margin: '0 0 0.2rem 0' }}>
                          {stage.description}
                        </p>
                        <a
                          href={`https://beratrail.io/address/${stage.contract}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-terminal"
                          style={{ fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none' }}
                          title={stage.contract}
                        >
                          {truncateAddress(stage.contract)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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

      {/* ── FBI Top 12 Fugitives — Prison-style wanted cards ── */}
      <section>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
          Searched by the FBI: TOP 7 fugitives
        </h2>
        <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '0.4rem', marginBottom: '0.5rem' }} />
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
          The most wanted accounts in the Mibera ecosystem
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.75rem' }}>
          {FBI_FUGITIVES.map((fugitive, idx) => (
            <a
              key={fugitive.handle}
              href={`https://x.com/${fugitive.handle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: 'none',
                background: '#111',
                border: '1px solid #f85149',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {/* Header bar */}
              <div style={{
                background: '#f85149',
                color: '#000',
                padding: '0.3rem 0.6rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span className="font-terminal" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  WANTED
                </span>
                <span className="font-terminal" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                  #{String(idx + 1).padStart(3, '0')}
                </span>
              </div>

              {/* Card body */}
              <div style={{ display: 'flex', padding: '0.75rem', gap: '0.75rem' }}>
                {/* Mugshot */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{
                    width: '70px', height: '70px',
                    border: '2px solid #333',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                  }}>
                    {fugitive.avatarUrl ? (
                      <Image
                        src={fugitive.avatarUrl}
                        alt={fugitive.displayName}
                        width={70}
                        height={70}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        unoptimized
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" style={{ color: '#555' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="font-terminal" style={{ fontSize: '0.7rem', color: '#58a6ff' }}>
                    {fugitive.handle}
                  </span>
                </div>

                {/* Intel */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>
                    <span className="font-terminal" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {fugitive.displayName}
                    </span>
                    {fugitive.alias && (
                      <span className="font-terminal" style={{ fontSize: '0.8rem', color: '#ffd700', marginLeft: '0.4rem' }}>
                        aka &quot;{fugitive.alias}&quot;
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-terminal" style={{ fontSize: '0.7rem', color: '#f85149', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile: </span>
                    <span style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: 1.4 }}>{fugitive.profile}</span>
                  </div>
                  <div>
                    <span className="font-terminal" style={{ fontSize: '0.7rem', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facts: </span>
                    <span style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.4 }}>{fugitive.facts}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
