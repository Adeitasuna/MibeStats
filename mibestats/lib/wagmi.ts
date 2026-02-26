import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import type { Config } from 'wagmi'

export const berachain = defineChain({
  id: 80094,
  name: 'Berachain',
  nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.berachain.com'] },
  },
  blockExplorers: {
    default: { name: 'Berascan', url: 'https://berascan.com' },
  },
})

let _config: Config | null = null

export function getWagmiConfig(): Config | null {
  if (_config) return _config
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  if (!projectId) return null
  _config = getDefaultConfig({
    appName:   'MibeStats',
    projectId,
    chains:    [berachain],
    ssr:       true,
  })
  return _config
}

// Legacy export for backward compat — throws if projectId missing
export const wagmiConfig = null as unknown as Config
