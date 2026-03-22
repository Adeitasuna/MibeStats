import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { apiError } from '@/lib/api-error'

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
    ?? req.headers.get('x-api-key')
  const allowed = [process.env.INTERNAL_API_KEY, process.env.ADMIN_TOKEN].filter(Boolean)
  return allowed.length > 0 && !!token && allowed.includes(token)
}

/** DELETE /api/internal/feedback?id=123 */
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return apiError('Unauthorized', 401)

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return apiError('Missing id', 400)

  await prisma.feedback.delete({ where: { id: BigInt(id) } })

  return NextResponse.json({ ok: true })
}
