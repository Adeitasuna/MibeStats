import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { floorHistoryQuerySchema, parseSearchParams } from '@/lib/validation'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const revalidate = 3600   // 1-hour cache

interface DailySaleRow {
  day: Date
  min_price: string
}

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
  const now = new Date()
  let fromDate: Date | undefined

  if (range === '7d') {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (range === '30d') {
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  // Use daily median sale price from sales table (robust to outliers from false WBERA detections)
  const rows = fromDate
    ? await prisma.$queryRaw<DailySaleRow[]>`
        SELECT day, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_bera)::text AS min_price
        FROM (SELECT DATE(sold_at) AS day, price_bera FROM sales WHERE sold_at >= ${fromDate} AND price_bera >= 5) sub
        GROUP BY day
        ORDER BY day ASC
      `.catch(() => [] as DailySaleRow[])
    : await prisma.$queryRaw<DailySaleRow[]>`
        SELECT day, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_bera)::text AS min_price
        FROM (SELECT DATE(sold_at) AS day, price_bera FROM sales WHERE price_bera >= 5) sub
        GROUP BY day
        ORDER BY day ASC
      `.catch(() => [] as DailySaleRow[])

  if (rows.length === 0) {
    // Fallback to floor_price_history table
    const historyRows = await prisma.floorPriceHistory.findMany({
      where:   fromDate ? { recordedAt: { gte: fromDate } } : undefined,
      orderBy: { recordedAt: 'asc' },
      select:  { recordedAt: true, floorPrice: true },
    })
    const data = historyRows.map((r) => ({
      date:       r.recordedAt.toISOString().split('T')[0],
      floorPrice: Number(r.floorPrice),
    }))
    return NextResponse.json(data)
  }

  const data = rows.map((r) => ({
    date:       new Date(r.day).toISOString().split('T')[0],
    floorPrice: Number(r.min_price),
  }))

  return NextResponse.json(data)
}
