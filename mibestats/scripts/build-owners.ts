/**
 * build-owners.ts — Index Transfer events to build token→owner mapping.
 *
 * Fetches all Transfer events from the Mibera333 contract, replays them to
 * find the current owner of each token (last Transfer.to wins), and updates
 * tokens.owner_address in the DB.
 *
 * Usage:
 *   npx tsx scripts/build-owners.ts
 *
 * Idempotent: incremental from last processed block (stored in sync_state).
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getTransferLogs, getLatestBlock } from '../lib/rpc'

const prisma  = new PrismaClient()
const BATCH_BLOCKS = 2000n    // blocks per getLogs request
const SLEEP_MS     = 500      // 0.5s between batches

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('=== Transfer event owner indexer ===\n')

  // Load last processed block (incremental)
  const syncState = await prisma.syncState.findUnique({
    where: { key: 'owners_last_block' },
  })
  const startBlock = syncState ? BigInt(syncState.value) + 1n : 0n
  const latestBlock = await getLatestBlock()

  console.log(`Processing blocks ${startBlock} → ${latestBlock}`)

  // Map tokenId → current owner (from Transfer events)
  const ownerMap = new Map<number, string>()
  let batchCount = 0

  for (let from = startBlock; from <= latestBlock; from += BATCH_BLOCKS) {
    const to = from + BATCH_BLOCKS - 1n < latestBlock
      ? from + BATCH_BLOCKS - 1n
      : latestBlock

    const logs = await getTransferLogs(from, to)

    for (const log of logs) {
      const tokenId = Number(log.args.tokenId)
      const toAddr  = log.args.to?.toLowerCase()
      if (tokenId && toAddr) ownerMap.set(tokenId, toAddr)
    }

    batchCount++
    if (batchCount % 50 === 0) {
      console.log(`  Block ${to} / ${latestBlock} — ${ownerMap.size} owners mapped`)
    }

    if (from + BATCH_BLOCKS <= latestBlock) await sleep(SLEEP_MS)
  }

  console.log(`\nUpdating ${ownerMap.size} token owner_address values...`)

  // Bulk update via batched raw SQL
  const entries = Array.from(ownerMap.entries())
  const UPDATE_BATCH = 500

  for (let i = 0; i < entries.length; i += UPDATE_BATCH) {
    const batch = entries.slice(i, i + UPDATE_BATCH)

    // Build CASE WHEN ... THEN ... END update
    const cases    = batch.map(([id, addr]) => `WHEN ${id} THEN '${addr}'`).join('\n      ')
    const tokenIds = batch.map(([id]) => id).join(', ')

    await prisma.$executeRawUnsafe(`
      UPDATE tokens
      SET owner_address = CASE token_id
        ${cases}
      END
      WHERE token_id IN (${tokenIds})
    `)
  }

  // Save last processed block
  await prisma.syncState.upsert({
    where:  { key: 'owners_last_block' },
    update: { value: latestBlock.toString() },
    create: { key: 'owners_last_block', value: latestBlock.toString() },
  })

  const owned = await prisma.token.count({ where: { ownerAddress: { not: null } } })
  console.log(`\n✅ build-owners complete — ${owned} tokens have owner_address`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
