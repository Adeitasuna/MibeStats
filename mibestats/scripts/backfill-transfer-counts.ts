/**
 * backfill-transfer-counts.ts — One-time backfill of transfer_count.
 * Uses large batch sizes (50k blocks) for faster scanning.
 * Run once, then daily sync-owners handles incremental updates.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getTransferLogs, getLatestBlock } from '../lib/rpc'

const prisma = new PrismaClient()
const BATCH_BLOCKS = 50_000n
const SLEEP_MS = 300

const CONTRACT_DEPLOY_BLOCK = 3_837_808n

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('=== Backfill transfer counts ===')

  // Reset transfer_count to 0
  await prisma.$executeRaw`UPDATE tokens SET transfer_count = 0`
  console.log('Reset all transfer_count to 0')

  const latestBlock = await getLatestBlock()
  console.log(`Scanning blocks ${CONTRACT_DEPLOY_BLOCK} -> ${latestBlock}`)

  const transferCounts = new Map<number, number>()
  let totalLogs = 0

  for (let from = CONTRACT_DEPLOY_BLOCK; from <= latestBlock; from += BATCH_BLOCKS) {
    const to = from + BATCH_BLOCKS - 1n < latestBlock ? from + BATCH_BLOCKS - 1n : latestBlock

    try {
      const logs = await getTransferLogs(from, to)
      for (const log of logs) {
        const id = Number(log.args.tokenId)
        if (id) {
          transferCounts.set(id, (transferCounts.get(id) ?? 0) + 1)
          totalLogs++
        }
      }
      console.log(`  Block ${to} — ${logs.length} transfers (total: ${totalLogs})`)
    } catch (err) {
      // If batch too large, split into smaller chunks
      console.log(`  Large batch failed at ${from}-${to}, splitting...`)
      const SMALL = 10_000n
      for (let sf = from; sf <= to; sf += SMALL) {
        const st = sf + SMALL - 1n < to ? sf + SMALL - 1n : to
        try {
          const logs = await getTransferLogs(sf, st)
          for (const log of logs) {
            const id = Number(log.args.tokenId)
            if (id) {
              transferCounts.set(id, (transferCounts.get(id) ?? 0) + 1)
              totalLogs++
            }
          }
        } catch (e) {
          console.error(`    Sub-batch ${sf}-${st} failed: ${e instanceof Error ? e.message : e}`)
        }
        await sleep(SLEEP_MS)
      }
    }

    if (from + BATCH_BLOCKS <= latestBlock) await sleep(SLEEP_MS)
  }

  console.log(`\nTotal: ${totalLogs} transfer events for ${transferCounts.size} tokens`)

  // Batch update
  const entries = Array.from(transferCounts.entries())
  const BATCH = 500
  for (let i = 0; i < entries.length; i += BATCH) {
    const b = entries.slice(i, i + BATCH)
    const cases = b.map(([id, count]) => `WHEN ${id} THEN ${count}`).join('\n      ')
    const ids = b.map(([id]) => id).join(', ')
    await prisma.$executeRawUnsafe(`
      UPDATE tokens SET transfer_count = CASE token_id ${cases} END
      WHERE token_id IN (${ids})
    `)
  }

  // Also save the owners checkpoint so daily sync continues from here
  await prisma.syncState.upsert({
    where: { key: 'owners_last_block' },
    update: { value: latestBlock.toString() },
    create: { key: 'owners_last_block', value: latestBlock.toString() },
  })

  console.log(`Done! Updated ${transferCounts.size} tokens, checkpoint at block ${latestBlock}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
