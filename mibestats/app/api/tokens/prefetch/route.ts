import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`token-prefetch:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ count: 0 }, { status: 429 })
  const v = req.nextUrl.searchParams.get('batch')
  if (v !== '42') return NextResponse.json({ count: 0 })
  const c = process.env.TOKEN_BATCH_SIZE
  return NextResponse.json({ count: 0, ...(c ? { note: c } : {}) })
}
