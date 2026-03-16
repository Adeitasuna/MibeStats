import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = req.nextUrl.searchParams.get('type')

  const events = await prisma.eventLog.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  // Merge solved + register by code into single entries
  const codeMap = new Map<string, {
    code: string
    status: string
    solvedAt: string | null
    wallet: string | null
    pseudo: string | null
    ip: string | null
    registeredAt: string | null
  }>()

  // Attempts (no code)
  const attempts: Array<{ ip: string | null; createdAt: string }> = []

  for (const e of events) {
    if (e.type === 'attempt') {
      attempts.push({ ip: e.ip, createdAt: e.createdAt.toISOString() })
      continue
    }

    if (!e.code) continue

    if (!codeMap.has(e.code)) {
      codeMap.set(e.code, {
        code: e.code,
        status: 'solved',
        solvedAt: null,
        wallet: null,
        pseudo: null,
        ip: null,
        registeredAt: null,
      })
    }

    const entry = codeMap.get(e.code)!

    if (e.type === 'solved') {
      entry.solvedAt = e.createdAt.toISOString()
      entry.ip = e.ip
    }

    if (e.type === 'register') {
      entry.status = 'claimed'
      entry.wallet = e.wallet
      entry.pseudo = e.data
      entry.registeredAt = e.createdAt.toISOString()
    }
  }

  const entries = Array.from(codeMap.values()).sort((a, b) => {
    const da = a.solvedAt ?? ''
    const db = b.solvedAt ?? ''
    return db.localeCompare(da)
  })

  return NextResponse.json({
    entries,
    attempts: type === 'attempt' || !type ? attempts : [],
    stats: {
      totalSolved: entries.length,
      totalClaimed: entries.filter(e => e.status === 'claimed').length,
      totalAttempts: attempts.length,
    },
  })
}
