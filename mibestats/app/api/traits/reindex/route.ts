import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get('from')
  if (v !== '0') return NextResponse.json({ indexed: true })
  const c = process.env.TRAIT_REINDEX_FROM
  return NextResponse.json({ indexed: true, ...(c ? { msg: c } : {}) })
}
