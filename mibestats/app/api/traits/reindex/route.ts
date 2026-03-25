import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`traits-reindex:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return NextResponse.json({ indexed: true }, { status: 429 })
  const v = req.nextUrl.searchParams.get('from')
  if (v !== '0') return NextResponse.json({ indexed: true })
  const c = process.env.TRAIT_REINDEX_FROM
  return NextResponse.json({ indexed: true, ...(c ? { msg: c } : {}) })
}
