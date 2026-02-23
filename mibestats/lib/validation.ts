import { z } from 'zod'
import { isAddress } from 'viem'

// ─── Wallet address ───────────────────────────────────────────────────────────

export const addressSchema = z
  .string()
  .refine((addr) => isAddress(addr, { strict: true }), {
    message: 'Invalid EIP-55 checksummed address',
  })

// ─── Token filters ────────────────────────────────────────────────────────────

const swagRankEnum = z.enum(['SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'F'])

export const tokenQuerySchema = z.object({
  archetype:    z.string().max(50).optional(),
  ancestor:     z.string().max(50).optional(),
  element:      z.string().max(20).optional(),
  drug:         z.string().max(60).optional(),
  hat:          z.string().max(80).optional(),
  glasses:      z.string().max(80).optional(),
  shirt:        z.string().max(80).optional(),
  background:   z.string().max(80).optional(),
  swag_rank:    swagRankEnum.optional(),
  is_grail:     z.coerce.boolean().optional(),
  sort: z
    .enum(['swag_desc', 'swag_asc', 'id_asc', 'price_desc'])
    .default('swag_desc'),
  page:         z.coerce.number().int().min(1).default(1),
  limit:        z.coerce.number().int().min(1).max(100).default(50),
})

export type TokenQuery = z.infer<typeof tokenQuerySchema>

// ─── Sales filters ────────────────────────────────────────────────────────────

export const salesQuerySchema = z.object({
  token_id:     z.coerce.number().int().min(1).max(10000).optional(),
  min_price:    z.coerce.number().min(0).optional(),
  max_price:    z.coerce.number().min(0).optional(),
  from_date:    z.string().datetime({ offset: true }).optional(),
  to_date:      z.string().datetime({ offset: true }).optional(),
  is_grail:     z.coerce.boolean().optional(),
  page:         z.coerce.number().int().min(1).default(1),
  limit:        z.coerce.number().int().min(1).max(200).default(50),
})

export type SalesQuery = z.infer<typeof salesQuerySchema>

// ─── Floor history ────────────────────────────────────────────────────────────

export const floorHistoryQuerySchema = z.object({
  range: z.enum(['7d', '30d', 'all']).default('30d'),
})

// ─── Token ID ─────────────────────────────────────────────────────────────────

export const tokenIdSchema = z.coerce.number().int().min(1).max(10000)

// ─── Helper: parse search params ─────────────────────────────────────────────

export function parseSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(searchParams)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] : v!]),
  )
}
