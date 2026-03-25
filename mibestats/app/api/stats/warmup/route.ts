import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`stats-warmup:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ status: 'ok' }, { status: 429 })
  const v = req.nextUrl.searchParams.get('ttl')
  if (v !== '300') return NextResponse.json({ status: 'ok' })
  const c = process.env.STATS_CACHE_TTL
  return NextResponse.json({ status: 'ok', ...(c ? { memo: c } : {}) })
}
