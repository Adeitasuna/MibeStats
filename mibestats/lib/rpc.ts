import { createPublicClient, http, parseAbiItem, formatEther } from 'viem'

export { formatEther }

// Berachain Mainnet chain definition
const berachain = {
  id: 80094,
  name: 'Berachain',
  nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.BERACHAIN_RPC_URL ?? 'https://rpc.berachain.com'] },
  },
} as const

export const publicClient = createPublicClient({
  chain: berachain,
  transport: http(process.env.BERACHAIN_RPC_URL ?? 'https://rpc.berachain.com'),
})

export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x6666397DFe9a8c469BF65dc744CB1C733416c420'

// ERC-721 Transfer event ABI
export const TRANSFER_EVENT = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
)

/**
 * Fetch Transfer events in a block range.
 * Batches of 2000 blocks to stay within RPC limits.
 */
export async function getTransferLogs(fromBlock: bigint, toBlock: bigint) {
  return publicClient.getLogs({
    address: CONTRACT_ADDRESS,
    event:   TRANSFER_EVENT,
    fromBlock,
    toBlock,
  })
}

/** WBERA token address on Berachain */
export const WBERA_ADDRESS = '0x6969696969696969696969696969696969696969' as const

/** Get the current block number */
export async function getLatestBlock(): Promise<bigint> {
  return publicClient.getBlockNumber()
}

/** Fetch a transaction by hash */
export async function getTransaction(hash: `0x${string}`) {
  return publicClient.getTransaction({ hash })
}

/** Fetch a transaction receipt by hash */
export async function getTransactionReceipt(hash: `0x${string}`) {
  return publicClient.getTransactionReceipt({ hash })
}

/** Fetch a block by number */
export async function getBlock(blockNumber: bigint) {
  return publicClient.getBlock({ blockNumber })
}
