/**
 * import-codex.ts — One-time import of all Mibera NFTs from mibera-codex.
 *
 * Fetches miberas.jsonl (6.4 MB) and grails.jsonl from the mibera-codex GitHub
 * raw CDN, validates each record, bulk-inserts into PostgreSQL, and computes
 * rarity_rank for all tokens.
 *
 * Usage:
 *   npx tsx scripts/import-codex.ts
 *
 * Idempotent: uses upsert semantics — safe to re-run.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// ─── Codex raw URLs ──────────────────────────────────────────────────────────

const CODEX_BASE =
  'https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data'
const MIBERAS_URL  = `${CODEX_BASE}/miberas.jsonl`
const GRAILS_URL   = `${CODEX_BASE}/grails.jsonl`
const IMAGE_BASE   = 'https://mibera.fsn1.your-objectstorage.com'

// ─── Validation schemas ───────────────────────────────────────────────────────

// Some codex fields are occasionally numeric (e.g. glasses: 3) — coerce to string
const traitField = z.preprocess(
  (v) => (typeof v === 'number' ? String(v) : v),
  z.string().optional().nullable(),
)

const MiberaSchema = z.object({
  id:               z.number().int().min(1).max(10000),
  type:             z.literal('mibera'),
  archetype:        z.string(),
  ancestor:         z.string(),
  time_period:      z.string(),
  birthday:         z.string().optional().nullable(),
  birth_coordinates:z.string().optional().nullable(),
  sun_sign:         traitField,
  moon_sign:        traitField,
  ascending_sign:   traitField,
  element:          traitField,
  swag_rank:        z.string(),
  swag_score:       z.number().int(),
  // image_url is present in the codex; fall back to constructed URL if absent
  image_url:        z.string().url().optional().nullable(),
  background:       traitField,
  body:             traitField,
  eyes:             traitField,
  eyebrows:         traitField,
  mouth:            traitField,
  hair:             traitField,
  shirt:            traitField,
  hat:              traitField,
  glasses:          traitField,
  mask:             traitField,
  earrings:         traitField,
  face_accessory:   traitField,
  tattoo:           traitField,
  item:             traitField,
  drug:             traitField,
}).passthrough()   // allow extra fields without error

const GrailSchema = z.object({
  id:       z.number().int(),
  name:     z.string(),
  type:     z.literal('grail'),
  category: z.string(),
  slug:     z.string(),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJsonl<T>(url: string, schema: z.ZodType<T>): Promise<T[]> {
  console.log(`Fetching ${url} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)

  const text  = await res.text()
  const lines = text.split('\n').filter((l) => l.trim())
  const items: T[] = []
  let errors = 0

  for (let i = 0; i < lines.length; i++) {
    try {
      const raw    = JSON.parse(lines[i])
      const parsed = schema.parse(raw)
      items.push(parsed)
    } catch (err) {
      errors++
      if (errors <= 3) {
        const msg = err instanceof z.ZodError
          ? err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
          : err instanceof Error ? err.message : String(err)
        console.warn(`  ⚠ Parse error on line ${i + 1}: ${msg}`)
      }
    }
  }

  if (errors > 0) console.warn(`  ⚠ ${errors} records failed validation`)
  return items
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== mibera-codex import ===\n')

  // 1. Fetch grails first (small file)
  const grails = await fetchJsonl(GRAILS_URL, GrailSchema)
  console.log(`Fetched ${grails.length} grails`)
  const grailMap = new Map(grails.map((g) => [g.id, g]))

  // 2. Fetch all 10,000 miberas
  const miberas = await fetchJsonl(MIBERAS_URL, MiberaSchema)
  console.log(`Fetched ${miberas.length} miberas\n`)

  // 3. Bulk upsert in batches of 500
  const BATCH = 500
  let imported = 0

  for (let i = 0; i < miberas.length; i += BATCH) {
    const batch = miberas.slice(i, i + BATCH)

    const data = batch.map((m) => {
      const g = grailMap.get(m.id)
      // Prefer image_url from codex; fall back to object-storage convention
      const imageUrl = m.image_url ?? `${IMAGE_BASE}/${m.id}.png`
      return {
        tokenId:          m.id,
        archetype:        m.archetype,
        ancestor:         m.ancestor,
        timePeriod:       m.time_period,
        birthday:         m.birthday ?? null,
        birthCoordinates: m.birth_coordinates ?? null,
        sunSign:          m.sun_sign ?? null,
        moonSign:         m.moon_sign ?? null,
        ascendingSign:    m.ascending_sign ?? null,
        element:          m.element ?? null,
        swagScore:        m.swag_score,
        swagRank:         m.swag_rank,
        imageUrl,
        background:       m.background ?? null,
        body:             m.body ?? null,
        eyes:             m.eyes ?? null,
        eyebrows:         m.eyebrows ?? null,
        mouth:            m.mouth ?? null,
        hair:             m.hair ?? null,
        shirt:            m.shirt ?? null,
        hat:              m.hat ?? null,
        glasses:          m.glasses ?? null,
        mask:             m.mask ?? null,
        earrings:         m.earrings ?? null,
        faceAccessory:    m.face_accessory ?? null,
        tattoo:           m.tattoo ?? null,
        item:             m.item ?? null,
        drug:             m.drug ?? null,
        isGrail:          !!g,
        grailName:        g?.name ?? null,
        grailCategory:    g?.category ?? null,
      }
    })

    await prisma.token.createMany({ data, skipDuplicates: true })
    imported += batch.length

    if (imported % 2000 === 0 || imported === miberas.length) {
      console.log(`  Imported ${imported}/${miberas.length} tokens...`)
    }
  }

  // 4. Compute rarity_rank via raw SQL (RANK over swag_score DESC)
  console.log('\nComputing rarity_rank...')
  await prisma.$executeRaw`
    UPDATE tokens t
    SET rarity_rank = r.rank
    FROM (
      SELECT token_id, RANK() OVER (ORDER BY swag_score DESC) AS rank
      FROM tokens
    ) r
    WHERE t.token_id = r.token_id
  `

  // 5. Assertions
  const count = await prisma.token.count()
  const grailCount = await prisma.token.count({ where: { isGrail: true } })
  console.log(`\n✓ tokens table: ${count} rows (expected 10000)`)
  console.log(`✓ grail tokens:  ${grailCount} (expected 42)`)

  if (count !== 10000) console.warn(`⚠ Expected 10000 tokens, got ${count} — check codex source`)

  console.log('\n✅ import-codex complete')
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
