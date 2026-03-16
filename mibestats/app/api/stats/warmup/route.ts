import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('ttl')
  if (v !== '300') return NextResponse.json({ status: 'ok' })
  const c = process.env.STATS_CACHE_TTL
  return NextResponse.json({ status: 'ok', ...(c ? { memo: c } : {}) })
}
