/**
 * sync-owners.ts — Daily incremental owner sync.
 * Fetches Transfer events since last processed block and updates owner_address.
 * Run by GitHub Actions cron at 00:30 UTC daily.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getTransferLogs, getLatestBlock } from '../lib/rpc'

const prisma     = new PrismaClient()
const BATCH_BLOCKS = 2000n
const SLEEP_MS     = 500

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('=== Daily owner sync ===')

  const syncState = await prisma.syncState.findUnique({ where: { key: 'owners_last_block' } })
  const startBlock  = syncState ? BigInt(syncState.value) + 1n : 0n
  const latestBlock = await getLatestBlock()

  if (startBlock > latestBlock) {
    console.log('✅ Already up to date')
    return
  }

  console.log(`Blocks ${startBlock} → ${latestBlock}`)
  const ownerMap = new Map<number, string>()

  for (let from = startBlock; from <= latestBlock; from += BATCH_BLOCKS) {
    const to = from + BATCH_BLOCKS - 1n < latestBlock ? from + BATCH_BLOCKS - 1n : latestBlock
    const logs = await getTransferLogs(from, to)
    for (const log of logs) {
      const id   = Number(log.args.tokenId)
      const addr = log.args.to?.toLowerCase()
      if (id && addr) ownerMap.set(id, addr)
    }
    if (from + BATCH_BLOCKS <= latestBlock) await sleep(SLEEP_MS)
  }

  if (ownerMap.size > 0) {
    const entries = Array.from(ownerMap.entries())
    const BATCH = 500
    for (let i = 0; i < entries.length; i += BATCH) {
      const b    = entries.slice(i, i + BATCH)
      const cases   = b.map(([id, addr]) => `WHEN ${id} THEN '${addr}'`).join('\n      ')
      const ids     = b.map(([id]) => id).join(', ')
      await prisma.$executeRawUnsafe(`
        UPDATE tokens SET owner_address = CASE token_id ${cases} END
        WHERE token_id IN (${ids})
      `)
    }
  }

  await prisma.syncState.upsert({
    where:  { key: 'owners_last_block' },
    update: { value: latestBlock.toString() },
    create: { key: 'owners_last_block', value: latestBlock.toString() },
  })

  console.log(`✅ sync-owners complete — ${ownerMap.size} owners updated`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
