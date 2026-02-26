/**
 * update-image-urls.ts — Patch all token image URLs from mibera-codex.
 *
 * Fetches mibera-image-urls.json and batch-updates the imageUrl column.
 *
 * Usage:
 *   npx tsx scripts/update-image-urls.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const IMAGE_URLS_URL =
  'https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data/mibera-image-urls.json'

async function main() {
  console.log('Fetching image URLs from mibera-codex…')
  const res = await fetch(IMAGE_URLS_URL)
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  const urls: Record<string, string> = await res.json()
  console.log(`  Got ${Object.keys(urls).length} entries`)

  const BATCH = 500
  const entries = Object.entries(urls)

  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH)

    await prisma.$transaction(
      batch.map(([tokenId, imageUrl]) =>
        prisma.token.update({
          where: { tokenId: Number(tokenId) },
          data: { imageUrl },
        }),
      ),
    )

    const done = Math.min(i + BATCH, entries.length)
    process.stdout.write(`\r  Updated ${done} / ${entries.length}`)
  }

  console.log('\nDone!')
}

main()
  .catch((err) => { console.error('ERROR:', err.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
