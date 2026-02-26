import type { Metadata } from 'next'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { AppShell } from '@/components/layout/AppShell'
import { Web3Providers } from '@/components/providers/Web3Providers'

export const metadata: Metadata = {
  title: {
    default:  'MibeStats — Mibera333 Analytics',
    template: '%s | MibeStats',
  },
  description:
    'Real-time NFT analytics for the Mibera333 collection on Berachain. Floor price, volume, rarity explorer, sales history, and wallet portfolio.',
  icons: {
    icon: 'https://gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/db60349b44a4dd31e595e2ba0d238c184696565a.png',
    apple: 'https://gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/db60349b44a4dd31e595e2ba0d238c184696565a.png',
  },
  openGraph: {
    title:       'MibeStats — Mibera333 Analytics',
    description: 'Real-time NFT analytics for Mibera333 on Berachain.',
    siteName:    'MibeStats',
    locale:      'en_US',
    type:        'website',
    images: [
      {
        url:    'https://gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/db60349b44a4dd31e595e2ba0d238c184696565a.png',
        width:  512,
        height: 512,
        alt:    'Mibera #333',
      },
    ],
  },
  twitter: {
    card:  'summary',
    title: 'MibeStats — Mibera333 Analytics',
    description: 'Real-time NFT analytics for Mibera333 on Berachain.',
    images: ['https://gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/db60349b44a4dd31e595e2ba0d238c184696565a.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Web3Providers>
          <AppShell>
            {children}
          </AppShell>
        </Web3Providers>
      </body>
    </html>
  )
}
