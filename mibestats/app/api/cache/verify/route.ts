import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/db'

const V = process.env.DB_INTEGRITY_HASH ?? ''

const attempts = new Map<string, { count: number; resetAt: number; lastAt: number }>()
const MAX = 2
const W = 6 * 60 * 60 * 1000
const DELAY = 30 * 1000

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const addr = getIp(req)
  const now = Date.now()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Wallet registration (second call after success)
  if (body.wallet && body.code && typeof body.wallet === 'string' && typeof body.code === 'string') {
    try {
      await prisma.eventLog.create({
        data: {
          type: 'register',
          code: body.code,
          wallet: body.wallet,
          ip: addr,
          data: typeof body.pseudo === 'string' ? body.pseudo : null,
        },
      })
      return NextResponse.json({ registered: true })
    } catch {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
  }

  // Rate limit
  const entry = attempts.get(addr)
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX) {
      const m = Math.ceil((entry.resetAt - now) / 60000)
      return NextResponse.json({ error: `Too many attempts. Try again in ${m} minutes.`, remaining: 0 }, { status: 429 })
    }
    const elapsed = now - entry.lastAt
    if (elapsed < DELAY) {
      const wait = Math.ceil((DELAY - elapsed) / 1000)
      return NextResponse.json({ error: `Please wait ${wait} seconds before trying again.`, remaining: MAX - entry.count, wait }, { status: 429 })
    }
    entry.count++
    entry.lastAt = now
  } else {
    attempts.set(addr, { count: 1, resetAt: now + W, lastAt: now })
  }

  const remaining = MAX - (attempts.get(addr)?.count ?? 0)

  const input = body.words
  if (body.email || body.name || body.url) {
    return NextResponse.json({ success: false, remaining, message: 'Incorrect.' })
  }
  if (!Array.isArray(input) || input.length !== 7) {
    return NextResponse.json({ error: 'Invalid input', remaining }, { status: 400 })
  }

  const h = createHash('sha256').update(input.map((w: string) => w.trim().toLowerCase()).join(' ')).digest('hex')

  if (h !== V) {
    // Log failed attempt
    await prisma.eventLog.create({
      data: { type: 'attempt', ip: addr, data: `remaining=${remaining}` },
    }).catch(() => {})

    return NextResponse.json({
      success: false,
      remaining,
      message: remaining > 0
        ? `Incorrect. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining. Next attempt available in 30 seconds.`
        : 'Incorrect. No attempts remaining. Try again later.',
    })
  }

  const code = `MIBE-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`

  // Log success
  await prisma.eventLog.create({
    data: { type: 'solved', code, ip: addr },
  }).catch(() => {})

  attempts.delete(addr)

  return NextResponse.json({ success: true, code })
}
