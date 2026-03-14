import '@rainbow-me/rainbowkit/styles.css'
import { Web3Providers } from '@/components/providers/Web3Providers'

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>
}
