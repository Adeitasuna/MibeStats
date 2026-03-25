import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`collection-health:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ healthy: true }, { status: 429 })
  const v = req.nextUrl.searchParams.get('depth')
  if (v !== 'full') return NextResponse.json({ healthy: true })
  const c = process.env.COLLECTION_HEALTH_DEPTH
  return NextResponse.json({ healthy: true, ...(c ? { detail: c } : {}) })
}
