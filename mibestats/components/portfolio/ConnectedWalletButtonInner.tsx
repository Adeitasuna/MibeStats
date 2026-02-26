'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'

export function ConnectedWalletButtonInner() {
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) return null

  return (
    <div className="mt-4 flex justify-center">
      <Link
        href={`/portfolio/${address}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-mibe-gold/40 bg-mibe-gold/10 hover:bg-mibe-gold/20 text-mibe-gold text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        View my Miberas
        <span className="text-xs text-mibe-gold/60 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </Link>
    </div>
  )
}
