import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { floorHistoryQuerySchema, parseSearchParams } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const revalidate = 3600   // 1-hour cache

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`floor-history:${ip}`, 100, 60)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs - Date.now()) / 1000)) } },
    )
  }

  const parsed = floorHistoryQuerySchema.safeParse(
    parseSearchParams(Object.fromEntries(req.nextUrl.searchParams)),
  )
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { range } = parsed.data
  const now   = new Date()
  let fromDate: Date | undefined

  if (range === '7d') {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (range === '30d') {
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
  // 'all' → no fromDate filter

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
}
