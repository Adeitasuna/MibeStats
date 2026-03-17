import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { floorHistoryQuerySchema, parseSearchParams } from '@/lib/validation'
import { withRateLimit } from '@/lib/api-handler'
import { apiError } from '@/lib/api-error'

export const revalidate = 3600   // 1-hour cache

export const GET = withRateLimit('floor-history', 100, async (req) => {
  const parsed = floorHistoryQuerySchema.safeParse(
    parseSearchParams(Object.fromEntries(req.nextUrl.searchParams)),
  )
  if (!parsed.success) {
    return apiError('Invalid parameters', 400)
  }

  const { range } = parsed.data
  let fromDate: Date | undefined

  if (range === '7d') {
    fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  } else if (range === '30d') {
    fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }

  // Use real floor price snapshots (from API captures), not sales minimum
  const rows = await prisma.floorPriceHistory.findMany({
    where:   fromDate ? { recordedAt: { gte: fromDate } } : undefined,
    orderBy: { recordedAt: 'asc' },
    select:  { recordedAt: true, floorPrice: true },
  })

  const data = rows.map((r) => ({
    date:       r.recordedAt.toISOString().split('T')[0],
    floorPrice: Number(r.floorPrice),
  }))

  return NextResponse.json(data)
}, { cacheSecs: 3600 })
