import type { Metadata } from 'next'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Web3Providers } from '@/components/providers/Web3Providers'

export const metadata: Metadata = {
  title: {
    default:  'MibeStats — Mibera333 Analytics',
    template: '%s | MibeStats',
  },
  description:
    'Real-time NFT analytics for the Mibera333 collection on Berachain. Floor price, volume, rarity explorer, sales history, and wallet portfolio.',
  icons: {
    icon: 'https://mibera.fsn1.your-objectstorage.com/333.png',
    apple: 'https://mibera.fsn1.your-objectstorage.com/333.png',
  },
  openGraph: {
    title:       'MibeStats — Mibera333 Analytics',
    description: 'Real-time NFT analytics for Mibera333 on Berachain.',
    siteName:    'MibeStats',
    locale:      'en_US',
    type:        'website',
    images: [
      {
        url:    'https://mibera.fsn1.your-objectstorage.com/333.png',
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
    images: ['https://mibera.fsn1.your-objectstorage.com/333.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <Web3Providers>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </main>
          <Footer />
        </Web3Providers>
      </body>
    </html>
  )
}
