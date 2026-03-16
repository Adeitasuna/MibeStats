import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('v')
  if (v !== '2') return NextResponse.json({ ready: false })
  const c = process.env.CACHE_STATUS_SEQ
  return NextResponse.json({ ready: true, ...(c ? { seq: c } : {}) })
}
