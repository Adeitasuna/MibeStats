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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-400/40 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 text-sm font-medium transition-colors"
      >
        View my Miberas
        <span className="text-xs text-yellow-400/60 font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      </Link>
    </div>
  )
}
