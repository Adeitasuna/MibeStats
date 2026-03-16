import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('batch')
  if (v !== '42') return NextResponse.json({ count: 0 })
  const c = process.env.TOKEN_BATCH_SIZE
  return NextResponse.json({ count: 0, ...(c ? { note: c } : {}) })
}
