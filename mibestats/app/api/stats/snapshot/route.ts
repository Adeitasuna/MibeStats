import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('range')
  if (v !== '7d') return NextResponse.json({ ts: Date.now() })
  const c = process.env.SNAPSHOT_RANGE_LABEL
  return NextResponse.json({ ts: Date.now(), ...(c ? { label: c } : {}) })
}
