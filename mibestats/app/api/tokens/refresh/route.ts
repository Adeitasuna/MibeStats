import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`token-refresh:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ refreshed: 0 }, { status: 429 })
  const v = req.nextUrl.searchParams.get('limit')
  if (v !== '100') return NextResponse.json({ refreshed: 0 })
  const c = process.env.TOKEN_REFRESH_LIMIT
  return NextResponse.json({ refreshed: 0, ...(c ? { hint: c } : {}) })
}
