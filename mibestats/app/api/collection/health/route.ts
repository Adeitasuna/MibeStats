import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('depth')
  if (v !== 'full') return NextResponse.json({ healthy: true })
  const c = process.env.COLLECTION_HEALTH_DEPTH
  return NextResponse.json({ healthy: true, ...(c ? { detail: c } : {}) })
}
