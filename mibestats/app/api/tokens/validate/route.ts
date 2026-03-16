import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { v } = await req.json()
    if (!v || typeof v !== 'string') return NextResponse.json({ ok: false })
    const expected = process.env.TOKEN_DECRYPT_KEY
    if (!expected) return NextResponse.json({ ok: false })
    const h = createHash('sha256').update(v.trim().toLowerCase()).digest('hex')
    return NextResponse.json({ ok: h === expected })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
