import type { Metadata } from 'next'
import { WalletSearchBar } from '@/components/portfolio/WalletSearchBar'
import { ConnectedWalletButton } from '@/components/portfolio/ConnectedWalletButton'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Look up any Berachain wallet to see its Mibera333 holdings and portfolio stats.',
}

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Wallet Portfolio</h1>
        <p className="text-gray-400 text-sm">
          Enter any Berachain wallet address to see its Mibera333 holdings.
        </p>
      </div>

      <WalletSearchBar />
      <ConnectedWalletButton />
    </div>
  )
}
