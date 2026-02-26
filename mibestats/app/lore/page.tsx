import type { Metadata } from 'next'

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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="section-title text-3xl">MibeLore</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          Everything you need to know about the Mibera333 universe
        </p>
      </div>

      {/* Lore Documents */}
      <section>
        <h2 className="section-title text-xl mb-4">Lore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LORE_DOCUMENTS.map((doc) => (
            <a
              key={doc.title}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="card p-4 hover:border-mibe-gold transition-colors group flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-mibe-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-mibe-gold font-semibold group-hover:text-yellow-300 transition-colors text-sm">
                  {doc.title}
                </h3>
              </div>
              {doc.description && (
                <p className="text-mibe-text-2 text-xs leading-relaxed">{doc.description}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* Fractures — The Reveal Timeline */}
      <section>
        <h2 className="section-title text-xl mb-2">Fractures — The Reveal Timeline</h2>
        <p className="text-mibe-text-2 text-xs mb-4">
          10 soulbound ERC-721 collections marking each phase of Mibera&apos;s progressive reveal
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {FRACTURE_STAGES.map((stage) => (
            <div key={stage.phase} className="card p-3 flex flex-col gap-1.5 relative overflow-hidden">
              {/* Phase number watermark */}
              <span className="absolute -top-1 -right-1 text-[40px] font-bold text-white/[0.03] leading-none select-none">
                {stage.phase}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mibe-gold/20 text-mibe-gold text-[10px] font-bold shrink-0">
                  {stage.phase}
                </span>
                <span className="text-[10px] font-mono text-mibe-muted truncate">{stage.symbol}</span>
              </div>
              <h3 className="text-xs font-semibold text-white leading-tight">{stage.name}</h3>
              <p className="text-[10px] text-mibe-text-2 leading-snug flex-1">{stage.description}</p>
              <a
                href={`https://beratrail.io/address/${stage.contract}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-mibe-cyan hover:underline"
                title={stage.contract}
              >
                {truncateAddress(stage.contract)}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* On TOR */}
      <section>
        <h2 className="section-title text-xl mb-4">On TOR</h2>
        <div className="flex flex-wrap gap-2">
          {TOR_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="card px-4 py-2.5 text-sm font-medium text-mibe-cyan hover:text-white hover:border-mibe-cyan hover:bg-mibe-hover/50 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* FBI Top 12 Fugitives */}
      <section>
        <h2 className="section-title text-xl mb-2">
          Searched by the FBI: Twitter TOP 12 fugitives
        </h2>
        <p className="text-mibe-text-2 text-xs mb-4">The most wanted accounts in the Mibera ecosystem</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {FBI_FUGITIVES.map((fugitive) => (
            <a
              key={fugitive.handle}
              href={`https://x.com/${fugitive.handle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="card p-3 flex flex-col items-center gap-2 hover:border-mibe-magenta transition-colors group"
            >
              {/* Avatar placeholder — SVG silhouette */}
              <div className="w-14 h-14 rounded-full bg-mibe-hover flex items-center justify-center">
                <svg className="w-7 h-7 text-mibe-muted group-hover:text-mibe-magenta transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="text-xs font-semibold text-white group-hover:text-mibe-magenta transition-colors truncate">
                  {fugitive.displayName}
                </p>
                <p className="text-[10px] text-mibe-cyan truncate">{fugitive.handle}</p>
                <p className="text-[10px] text-mibe-muted mt-0.5">{fugitive.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
