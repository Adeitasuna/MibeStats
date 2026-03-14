import type { Metadata } from 'next'
import { WalletSearchBar } from '@/components/portfolio/WalletSearchBar'
import { ConnectedWalletButton } from '@/components/portfolio/ConnectedWalletButton'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Look up any Berachain wallet to see its Mibera333 holdings and portfolio stats.',
}

export default function PortfolioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center flex flex-col gap-2">
        <h1 className="section-title">Portfolio</h1>
        <p className="text-mibe-text-2 text-sm">
          Enter any Berachain wallet address to see its Mibera333 holdings.
        </p>
      </div>

      <WalletSearchBar />
      <ConnectedWalletButton />
    </div>
  )
}
