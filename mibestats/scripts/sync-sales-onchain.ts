/**
 * sync-sales-onchain.ts — Marketplace-agnostic on-chain sales sync.
 *
 * Scans ERC-721 Transfer events and detects sales by checking:
 *   1. Native BERA value (tx.value > 0)
 *   2. WBERA transfer logs in the receipt
 *
 * Follows sync-owners.ts pattern: block-by-block incremental scan via viem.
 * Run by GitHub Actions cron at 00:30 UTC daily.
 */

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { parseAbiItem } from 'viem'
import {
  getTransferLogs,
  getLatestBlock,
  getTransaction,
  getTransactionReceipt,
  getBlock,
  formatEther,
  WBERA_ADDRESS,
} from '../lib/rpc'

const prisma = new PrismaClient()
const BATCH_BLOCKS = 2000n
const LOG_SLEEP_MS = 500
const TX_SLEEP_MS  = 200

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// Contract deployed at block 3,837,808 — no point scanning before that
const CONTRACT_DEPLOY_BLOCK = 3_837_808n

// ERC-20 Transfer event for detecting WBERA payments
const ERC20_TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

interface SaleRecord {
  tokenId: number
  priceBera: Prisma.Decimal
  soldAt: Date
  buyerAddress: string
  sellerAddress: string
  txHash: string
  marketplace: string
}

async function main() {
  console.log('=== On-chain sales sync ===')

  const syncState = await prisma.syncState.findUnique({ where: { key: 'sales_onchain_last_block' } })
  const startBlock  = syncState ? BigInt(syncState.value) + 1n : CONTRACT_DEPLOY_BLOCK
  const latestBlock = await getLatestBlock()

  if (startBlock > latestBlock) {
    console.log('Already up to date')
    return
  }

  console.log(`Scanning blocks ${startBlock} -> ${latestBlock}`)

  // Phase 1: Collect all non-mint Transfer events, grouped by txHash
  const txGroups = new Map<string, Array<{
    tokenId: number
    from: string
    to: string
    blockNumber: bigint
  }>>()

  const totalBatches = Number((latestBlock - startBlock) / BATCH_BLOCKS) + 1
  let batchNum = 0

  for (let from = startBlock; from <= latestBlock; from += BATCH_BLOCKS) {
    batchNum++
    const to = from + BATCH_BLOCKS - 1n < latestBlock ? from + BATCH_BLOCKS - 1n : latestBlock
    const logs = await getTransferLogs(from, to)

    for (const log of logs) {
      const sender = log.args.from?.toLowerCase()
      const receiver = log.args.to?.toLowerCase()
      const id = Number(log.args.tokenId)

      // Skip mints
      if (!sender || sender === ZERO_ADDRESS) continue
      if (!receiver || !id || !log.transactionHash) continue

      const txHash = log.transactionHash.toLowerCase()
      if (!txGroups.has(txHash)) txGroups.set(txHash, [])
      txGroups.get(txHash)!.push({
        tokenId: id,
        from: sender,
        to: receiver,
        blockNumber: log.blockNumber,
      })
    }

    if (batchNum % 500 === 0 || from + BATCH_BLOCKS > latestBlock) {
      console.log(`  Phase 1: batch ${batchNum}/${totalBatches} (block ${to})`)
    }

    if (from + BATCH_BLOCKS <= latestBlock) await sleep(LOG_SLEEP_MS)
  }

  console.log(`Found ${txGroups.size} transactions with transfers`)

  // Phase 2: For each tx, check if it's a sale (native BERA or WBERA)
  const sales: SaleRecord[] = []
  let processed = 0

  for (const [txHash, transfers] of txGroups) {
    processed++
    if (processed % 100 === 0) {
      console.log(`  Processing tx ${processed}/${txGroups.size}`)
    }

    try {
      const tx = await getTransaction(txHash as `0x${string}`)
      await sleep(TX_SLEEP_MS)

      const nftCount = transfers.length
      let pricePer: bigint | null = null
      let marketplace = 'onchain'

      // Collect NFT buyer/seller addresses for WBERA filtering
      const nftBuyers  = new Set(transfers.map((t) => t.to))
      const nftSellers = new Set(transfers.map((t) => t.from))

      if (tx.value > 0n) {
        // Native BERA sale
        pricePer = tx.value / BigInt(nftCount)
      } else {
        // Check for WBERA payment in receipt logs
        const receipt = await getTransactionReceipt(txHash as `0x${string}`)
        await sleep(TX_SLEEP_MS)

        let wberaTotal = 0n
        for (const log of receipt.logs) {
          if (log.address.toLowerCase() !== WBERA_ADDRESS.toLowerCase()) continue
          if (log.topics[0] !== '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') continue
          // ERC-20 Transfer: topics[1]=from, topics[2]=to, data=value
          // Only count WBERA transfers involving the NFT buyer or seller
          const wberaFrom = log.topics[1] ? ('0x' + log.topics[1].slice(26)).toLowerCase() : ''
          const wberaTo   = log.topics[2] ? ('0x' + log.topics[2].slice(26)).toLowerCase() : ''
          const involvesParty = nftBuyers.has(wberaFrom) || nftSellers.has(wberaTo)
          if (!involvesParty) continue

          if (log.data && log.data !== '0x') {
            wberaTotal += BigInt(log.data)
          }
        }

        if (wberaTotal > 0n) {
          pricePer = wberaTotal / BigInt(nftCount)
          marketplace = 'onchain_wbera'
        }
      }

      // No value = free transfer, skip
      if (!pricePer || pricePer === 0n) continue

      // Get block timestamp for soldAt
      const block = await getBlock(transfers[0].blockNumber)
      await sleep(TX_SLEEP_MS)
      const soldAt = new Date(Number(block.timestamp) * 1000)

      for (const t of transfers) {
        sales.push({
          tokenId: t.tokenId,
          priceBera: new Prisma.Decimal(formatEther(pricePer)),
          soldAt,
          buyerAddress: t.to,
          sellerAddress: t.from,
          txHash,
          marketplace,
        })
      }
    } catch (err) {
      console.error(`  Error processing tx ${txHash}: ${err instanceof Error ? err.message : err}`)
      continue
    }
  }

  console.log(`Detected ${sales.length} sales`)

  // Phase 3: Insert sales (composite unique handles dedup with existing ME data)
  if (sales.length > 0) {
    const BATCH = 100
    let totalInserted = 0
    for (let i = 0; i < sales.length; i += BATCH) {
      const batch = sales.slice(i, i + BATCH)
      const result = await prisma.sale.createMany({ data: batch, skipDuplicates: true })
      totalInserted += result.count
    }
    console.log(`Inserted ${totalInserted} new sales (${sales.length - totalInserted} duplicates skipped)`)

    // Update per-token stats for all tokens that had sales
    const affectedTokenIds = [...new Set(sales.map((s) => s.tokenId))]
    await prisma.$executeRaw`
      UPDATE tokens t
      SET
        sale_count      = agg.cnt,
        last_sale_price = agg.last_price,
        last_sale_date  = agg.last_date,
        max_sale_price  = agg.max_price,
        max_sale_date   = agg.max_date
      FROM (
        SELECT
          token_id,
          COUNT(*)                                             AS cnt,
          (ARRAY_AGG(price_bera ORDER BY sold_at DESC))[1]    AS last_price,
          MAX(sold_at)                                         AS last_date,
          MAX(price_bera)                                      AS max_price,
          (ARRAY_AGG(sold_at ORDER BY price_bera DESC))[1]    AS max_date
        FROM sales
        WHERE token_id = ANY(${affectedTokenIds})
        GROUP BY token_id
      ) agg
      WHERE t.token_id = agg.token_id
    `
  }

  // Phase 4: Save checkpoint
  await prisma.syncState.upsert({
    where:  { key: 'sales_onchain_last_block' },
    update: { value: latestBlock.toString() },
    create: { key: 'sales_onchain_last_block', value: latestBlock.toString() },
  })

  console.log(`sync-sales-onchain complete — checkpoint at block ${latestBlock}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
