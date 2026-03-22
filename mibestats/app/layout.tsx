import type { Metadata } from 'next'
import { Inter, Share_Tech_Mono, Pirata_One } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { AgentationOverlay } from '@/components/dev/AgentationOverlay'
import { ConsoleGreeting } from '@/components/dev/ConsoleGreeting'
import { KonamiRain } from '@/components/dev/KonamiRain'
import { MiberaWord } from '@/components/dev/MiberaWord'
import { FloatingPanel } from '@/components/feedback/FloatingPanel'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
  display: 'swap',
})

const pirataOne = Pirata_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pirata-one',
  display: 'swap',
})

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
    <html lang="en" className={`dark ${inter.variable} ${shareTechMono.variable} ${pirataOne.variable}`}>
      <body className="min-h-screen">
        <ScrollToTop />
        <AppShell>
          {children}
        </AppShell>
        <AgentationOverlay />
        <ConsoleGreeting />
        <KonamiRain />
        <MiberaWord />
        <FloatingPanel />
      </body>
    </html>
  )
}
