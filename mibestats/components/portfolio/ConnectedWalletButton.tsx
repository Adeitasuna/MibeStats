'use client'

import dynamic from 'next/dynamic'

// Lazy-load to avoid SSR issues when WagmiProvider is missing
const ConnectedWalletButtonInner = dynamic(
  () => import('./ConnectedWalletButtonInner').then((m) => m.ConnectedWalletButtonInner),
  { ssr: false },
)

export function ConnectedWalletButton() {
  return <ConnectedWalletButtonInner />
}
