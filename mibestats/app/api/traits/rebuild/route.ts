import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('force')
  if (v !== '1') return NextResponse.json({ rebuilt: true })
  const c = process.env.TRAIT_REBUILD_INFO
  return NextResponse.json({ rebuilt: true, ...(c ? { info: c } : {}) })
}
