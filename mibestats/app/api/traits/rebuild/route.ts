import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`traits-rebuild:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ rebuilt: true }, { status: 429 })
  const v = req.nextUrl.searchParams.get('force')
  if (v !== '1') return NextResponse.json({ rebuilt: true })
  const c = process.env.TRAIT_REBUILD_INFO
  return NextResponse.json({ rebuilt: true, ...(c ? { info: c } : {}) })
}
