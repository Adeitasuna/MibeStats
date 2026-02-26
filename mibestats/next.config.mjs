import { execSync } from 'child_process'

/** @type {import('next').NextConfig} */

/* Build-time git info */
let gitHash = 'dev'
let gitDate = new Date().toISOString()
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim()
  gitDate = execSync('git log -1 --format=%cI').toString().trim()
} catch { /* fallback to defaults */ }

const cspHeader = `
  default-src 'self';
  img-src 'self' https://gateway.irys.xyz https://uploader.irys.xyz https://ipfs.io https://*.ipfs.dweb.link https://*.basemaps.cartocdn.com data: blob:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://rpc.berachain.com https://api-mainnet.magiceden.dev https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org https://*.web3modal.org https://*.reown.com wss://*.reown.com https://*.basemaps.cartocdn.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
`

const nextConfig = {
  env: {
    NEXT_PUBLIC_GIT_HASH: gitHash,
    NEXT_PUBLIC_GIT_DATE: gitDate,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.irys.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploader.irys.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
