'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FRACTURE_STAGES } from '@/lib/lore-data'

function FractureCard({
  stage,
  onImageClick,
}: {
  stage: (typeof FRACTURE_STAGES)[number]
  onImageClick: () => void
}) {
  return (
    <div className="card p-1.5 w-full max-w-[120px] text-center">
      <div
        onClick={(e) => { e.preventDefault(); onImageClick() }}
        className="w-[85px] h-[85px] mx-auto mb-1 rounded-sm overflow-hidden bg-mibe-hover flex items-center justify-center cursor-pointer"
      >
        <Image src={stage.imageUrl} alt={stage.name} width={85} height={85} className="object-contain max-w-full max-h-full" unoptimized />
      </div>
      <p className="font-terminal text-[0.8rem] font-semibold text-mibe-gold m-0 mb-0.5 leading-tight">
        {stage.name}
      </p>
      <p className="text-[0.7rem] text-mibe-text-2 leading-tight m-0 mb-0.5">
        {stage.description}
      </p>
      <a
        href={stage.mintUrl}
        target="_blank"
        rel="noreferrer"
        className="font-terminal mint-btn inline-block text-[0.65rem] font-bold text-mibe-gold bg-transparent border border-mibe-gold rounded-sm px-2 py-0.5 no-underline tracking-wide mt-1"
      >
        Mint
      </a>
    </div>
  )
}

export function FractureTimeline() {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxName, setLightboxName] = useState('')

  return (
    <>
      <div className="relative">
        {/* Continuous horizontal line behind all dots */}
        <div className="absolute top-1/2 left-[5%] right-[5%] h-0.5 bg-mibe-gold -translate-y-1/2 z-0" />

        <div className="flex items-center relative">
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
              <div key={stage.phase} className="flex flex-col items-center flex-1 min-w-0 relative">
                {/* Top area — card if even, date if odd */}
                <div className="flex flex-col justify-end items-center w-full px-0.5" style={{ height: cardH }}>
                  {isTop ? (
                    <FractureCard stage={stage} onImageClick={openLightbox} />
                  ) : (
                    <span className="font-terminal text-[0.7rem] whitespace-nowrap mb-1" style={{ color: dateColor }}>
                      {dateLabel}
                    </span>
                  )}
                </div>

                {/* Vertical connector (top) */}
                <div className="w-0.5 h-2 bg-mibe-gold" />

                {/* Phase dot */}
                <div className="w-[2.2rem] h-[2.2rem] rounded-full bg-mibe-bg border-2 border-mibe-gold flex items-center justify-center relative z-[2] shrink-0">
                  <span className="font-terminal text-[0.85rem] font-bold text-mibe-gold">
                    {stage.phase}
                  </span>
                </div>

                {/* Vertical connector (bottom) */}
                <div className="w-0.5 h-2 bg-mibe-gold" />

                {/* Bottom area — card if odd, date if even */}
                <div className="flex flex-col justify-start items-center w-full px-0.5" style={{ height: cardH }}>
                  {!isTop ? (
                    <FractureCard stage={stage} onImageClick={openLightbox} />
                  ) : (
                    <span className="font-terminal text-[0.7rem] whitespace-nowrap mt-1" style={{ color: dateColor }}>
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
          className="fixed inset-0 z-[9999] bg-black/85 flex flex-col items-center justify-center cursor-pointer gap-3"
        >
          <img
            src={lightboxUrl}
            alt={lightboxName}
            className="max-w-[90vw] max-h-[80vh] rounded-lg"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="font-terminal text-mibe-gold text-base">
            {lightboxName}
          </span>
        </div>
      )}
    </>
  )
}
