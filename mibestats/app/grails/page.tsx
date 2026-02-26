import Image from 'next/image'
import { SwagRankBadge } from '@/components/ui/SwagRankBadge'
import type { Metadata } from 'next'
import type { Token } from '@/types'
import { magicEdenUrl } from '@/types'

export const metadata: Metadata = {
  title: 'MibeGrails',
}

export const dynamic = 'force-dynamic'

interface GrailToken extends Token {
  magicEdenUrl: string
}

interface GrailsResponse {
  total: number
  categories: Record<string, GrailToken[]>
}

async function getGrails(): Promise<GrailsResponse | null> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const res = await fetch(`${base}/api/grails`, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    return res.json() as Promise<GrailsResponse>
  } catch {
    return null
  }
}

export default async function GrailsPage() {
  const data = await getGrails()

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="section-title text-3xl">MibeGrails</h1>
        <div className="card p-8 text-center text-mibe-text-2">
          Failed to load grails data. Please try again later.
        </div>
      </div>
    )
  }

  // Sort categories alphabetically
  const sortedCategories = Object.entries(data.categories).sort(([a], [b]) =>
    a.localeCompare(b),
  )

  // Flatten all grails for the grid view
  const allGrails = sortedCategories.flatMap(([, tokens]) => tokens)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="section-title text-3xl">MibeGrails</h1>
        <p className="text-mibe-text-2 text-sm mt-1">
          {data.total} hand-drawn 1/1 masterpieces
        </p>
      </div>

      {/* Grails grid — 7 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {allGrails.map((grail) => (
          <a
            key={grail.tokenId}
            href={magicEdenUrl(grail.tokenId)}
            target="_blank"
            rel="noreferrer"
            className="card-gold overflow-hidden group hover:shadow-lg hover:shadow-yellow-900/20 transition-all"
          >
            {/* Category label */}
            <div className="px-2 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-mibe-gold">
                {grail.grailCategory ?? 'Unknown'}
              </span>
            </div>

            {/* Image */}
            <div className="aspect-square relative m-1.5 rounded-lg overflow-hidden">
              {grail.imageUrl ? (
                <Image
                  src={grail.imageUrl}
                  alt={grail.grailName ?? `Mibera #${grail.tokenId}`}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 14vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-mibe-hover text-mibe-muted">
                  ?
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-white truncate">
                  {grail.grailName ?? `#${grail.tokenId}`}
                </span>
                <SwagRankBadge rank={grail.swagRank} size="sm" />
              </div>

              {/* Prices */}
              <div className="flex justify-between text-[10px]">
                <div className="flex flex-col">
                  <span className="text-mibe-muted">Max</span>
                  <span className="text-white font-medium">
                    {grail.maxSalePrice != null ? `${Number(grail.maxSalePrice).toFixed(1)}` : '—'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-mibe-muted">Last</span>
                  <span className="text-white font-medium">
                    {grail.lastSalePrice != null ? `${Number(grail.lastSalePrice).toFixed(1)}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* By Category view */}
      <div className="flex flex-col gap-8 mt-4">
        <h2 className="section-title text-xl">By Category</h2>
        {sortedCategories.map(([category, tokens]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-mibe-gold mb-3 uppercase tracking-wider">
              {category} ({tokens.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
              {tokens.map((grail) => (
                <a
                  key={grail.tokenId}
                  href={magicEdenUrl(grail.tokenId)}
                  target="_blank"
                  rel="noreferrer"
                  className="card overflow-hidden group hover:border-mibe-gold transition-colors"
                >
                  <div className="aspect-square relative m-1 rounded-lg overflow-hidden">
                    {grail.imageUrl ? (
                      <Image
                        src={grail.imageUrl}
                        alt={grail.grailName ?? `Mibera #${grail.tokenId}`}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 14vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-mibe-hover text-mibe-muted">?</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-white truncate">
                      {grail.grailName ?? `#${grail.tokenId}`}
                    </p>
                    <p className="text-[10px] text-mibe-text-2">#{grail.tokenId}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
