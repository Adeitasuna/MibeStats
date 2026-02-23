'use client'

import Link from 'next/link'

export default function PortfolioAddressError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <p className="text-xl font-semibold text-red-400">Failed to load wallet portfolio</p>
      <p className="text-sm text-gray-400">
        Could not fetch holdings for this address. The data pipeline may be temporarily
        unavailable.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm transition-colors"
        >
          Try again
        </button>
        <Link
          href="/portfolio"
          className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors"
        >
          Search again
        </Link>
      </div>
    </div>
  )
}
