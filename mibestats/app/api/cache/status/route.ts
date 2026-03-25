import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`cache-status:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ ready: false }, { status: 429 })
  const v = req.nextUrl.searchParams.get('v')
  if (v !== '2') return NextResponse.json({ ready: false })
  const c = process.env.CACHE_STATUS_SEQ
  return NextResponse.json({ ready: true, ...(c ? { seq: c } : {}) })
}
