import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { apiError } from '@/lib/api-error'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
    ?? req.headers.get('x-api-key')
  const allowed = [process.env.INTERNAL_API_KEY, process.env.ADMIN_TOKEN].filter(Boolean)
  return allowed.length > 0 && !!token && allowed.includes(token)
}

/** PATCH /api/internal/bugs?id=123&status=resolved */
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return apiError('Unauthorized', 401)
  const rl = checkRateLimit(`internal-bugs:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return apiError('Too many requests', 429)

  const id = req.nextUrl.searchParams.get('id')
  const status = req.nextUrl.searchParams.get('status')
  if (!id || !status) return apiError('Missing id or status', 400)
  if (!['open', 'resolved'].includes(status)) return apiError('Invalid status', 400)

  await prisma.bugReport.update({
    where: { id: BigInt(id) },
    data: { status },
  })

  return NextResponse.json({ ok: true })
}

/** DELETE /api/internal/bugs?id=123 */
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return apiError('Unauthorized', 401)
  const rl2 = checkRateLimit(`internal-bugs:${getClientIp(req)}`, 30, 60)
  if (!rl2.success) return apiError('Too many requests', 429)

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return apiError('Missing id', 400)

  await prisma.bugReport.delete({ where: { id: BigInt(id) } })

  return NextResponse.json({ ok: true })
}
