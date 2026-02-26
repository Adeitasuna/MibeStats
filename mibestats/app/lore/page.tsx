import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

import {
  LORE_DOCUMENTS,
  TOR_LINKS,
  FBI_FUGITIVES,
  FRACTURE_STAGES,
} from '@/lib/lore-data'

export const metadata: Metadata = {
  title: 'MibeLore',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {LORE_DOCUMENTS.map((doc) => (
            <a
              key={doc.title}
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="card p-4 hover:border-mibe-gold transition-colors group"
            >
              <h3 className="text-mibe-gold font-semibold group-hover:text-yellow-300 transition-colors">
                {doc.title} ↗
              </h3>
              {doc.description && (
                <p className="text-mibe-text-2 text-sm mt-1">{doc.description}</p>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* Fractures — The Reveal Timeline */}
      <section>
        <h2 className="section-title text-xl mb-4">Fractures — The Reveal Timeline</h2>
        <p className="text-mibe-text-2 text-sm mb-4">
          10 soulbound ERC-721 collections marking each phase of Mibera&apos;s progressive reveal
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {FRACTURE_STAGES.map((stage) => (
            <div key={stage.phase} className="card p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-mibe-gold">{stage.label}</span>
                <span className="text-[10px] font-mono text-mibe-muted">{stage.symbol}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{stage.name}</h3>
              <p className="text-xs text-mibe-text-2 flex-1">{stage.description}</p>
              <a
                href={`https://beratrail.io/address/${stage.contract}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-mibe-cyan truncate hover:underline"
              >
                {stage.contract}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* On TOR */}
      <section>
        <h2 className="section-title text-xl mb-4">On TOR</h2>
        <div className="flex flex-wrap gap-3">
          {TOR_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="card px-4 py-2 text-sm text-mibe-cyan hover:text-white hover:border-mibe-cyan transition-colors"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </section>

      {/* FBI Top 12 Fugitives */}
      <section>
        <h2 className="section-title text-xl mb-4">
          Search by the FBI: Twitter TOP 12 fugitives
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {FBI_FUGITIVES.map((fugitive) => (
            <a
              key={fugitive.handle}
              href={`https://twitter.com/${fugitive.handle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="card p-3 flex flex-col items-center gap-2 hover:border-mibe-magenta transition-colors group"
            >
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-mibe-hover flex items-center justify-center text-2xl">
                🕵️
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white group-hover:text-mibe-magenta transition-colors">
                  {fugitive.displayName}
                </p>
                <p className="text-xs text-mibe-cyan">{fugitive.handle}</p>
                <p className="text-xs text-mibe-muted mt-0.5">{fugitive.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
