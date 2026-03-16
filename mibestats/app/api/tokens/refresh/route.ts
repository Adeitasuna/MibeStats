import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('limit')
  if (v !== '100') return NextResponse.json({ refreshed: 0 })
  const c = process.env.TOKEN_REFRESH_LIMIT
  return NextResponse.json({ refreshed: 0, ...(c ? { hint: c } : {}) })
}
