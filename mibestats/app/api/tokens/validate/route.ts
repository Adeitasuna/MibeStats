import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`token-validate:${getClientIp(req)}`, 10, 60)
  if (!rl.success) return NextResponse.json({ ok: false }, { status: 429 })
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
