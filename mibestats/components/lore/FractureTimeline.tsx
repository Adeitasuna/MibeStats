'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FRACTURE_STAGES } from '@/lib/lore-data'

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function FractureCard({
  stage,
  onImageClick,
}: {
  stage: (typeof FRACTURE_STAGES)[number]
  onImageClick: () => void
}) {
  return (
    <div className="card" style={{ padding: '0.4rem', width: '100%', maxWidth: '120px', textAlign: 'center' }}>
      <div
        onClick={(e) => { e.preventDefault(); onImageClick() }}
        style={{ width: '85px', height: '85px', margin: '0 auto 0.25rem', borderRadius: '4px', overflow: 'hidden', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <Image src={stage.imageUrl} alt={stage.name} width={85} height={85} style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }} unoptimized />
      </div>
      <p className="font-terminal" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffd700', margin: '0 0 0.1rem 0', lineHeight: 1.2 }}>
        {stage.name}
      </p>
      <p style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.25, margin: '0 0 0.15rem 0' }}>
        {stage.description}
      </p>
      <a href={`https://beratrail.io/address/${stage.contract}`} target="_blank" rel="noreferrer" className="font-terminal" style={{ fontSize: '0.7rem', color: '#58a6ff', textDecoration: 'none' }} title={stage.contract}>
        {truncateAddress(stage.contract)}
      </a>
    </div>
  )
}

export function FractureTimeline() {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxName, setLightboxName] = useState('')

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Continuous horizontal line behind all dots */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '5%',
          right: '5%',
          height: '2px',
          background: '#ffd700',
          transform: 'translateY(-50%)',
          zIndex: 0,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {FRACTURE_STAGES.map((stage, i) => {
            const isTop = i % 2 === 0
            const dateLabel = stage.date || 'TBD'
            const dateColor = stage.date ? '#ffd700' : '#555'
            const cardH = '240px'

            const openLightbox = () => {
              setLightboxUrl(stage.imageUrl)
              setLightboxName(stage.name)
            }

            return (
              <div key={stage.phase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, position: 'relative' }}>
                {/* Top area — card if even, date if odd */}
                <div style={{ height: cardH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%', padding: '0 0.1rem' }}>
                  {isTop ? (
                    <FractureCard stage={stage} onImageClick={openLightbox} />
                  ) : (
                    <span className="font-terminal" style={{ fontSize: '0.7rem', color: dateColor, whiteSpace: 'nowrap', marginBottom: '0.3rem' }}>
                      {dateLabel}
                    </span>
                  )}
                </div>

                {/* Vertical connector (top) */}
                <div style={{ width: '2px', height: '0.5rem', background: '#ffd700' }} />

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
                  position: 'relative',
                  zIndex: 2,
                  flexShrink: 0,
                }}>
                  <span className="font-terminal" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffd700' }}>
                    {stage.phase}
                  </span>
                </div>

                {/* Vertical connector (bottom) */}
                <div style={{ width: '2px', height: '0.5rem', background: '#ffd700' }} />

                {/* Bottom area — card if odd, date if even */}
                <div style={{ height: cardH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%', padding: '0 0.1rem' }}>
                  {!isTop ? (
                    <FractureCard stage={stage} onImageClick={openLightbox} />
                  ) : (
                    <span className="font-terminal" style={{ fontSize: '0.7rem', color: dateColor, whiteSpace: 'nowrap', marginTop: '0.3rem' }}>
                      {dateLabel}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: '0.75rem',
          }}
        >
          <img
            src={lightboxUrl}
            alt={lightboxName}
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '0.5rem', imageRendering: 'pixelated' }}
          />
          <span className="font-terminal" style={{ color: '#ffd700', fontSize: '1rem' }}>
            {lightboxName}
          </span>
        </div>
      )}
    </>
  )
}
