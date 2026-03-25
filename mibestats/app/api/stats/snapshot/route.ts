import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`stats-snapshot:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ ts: Date.now() }, { status: 429 })
  const v = req.nextUrl.searchParams.get('range')
  if (v !== '7d') return NextResponse.json({ ts: Date.now() })
  const c = process.env.SNAPSHOT_RANGE_LABEL
  return NextResponse.json({ ts: Date.now(), ...(c ? { label: c } : {}) })
}
