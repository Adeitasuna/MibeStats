import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { apiError } from '@/lib/api-error'
import { trackEvent } from '@/lib/analytics'

const feedbackSchema = z.object({
  score: z.number().int().refine((n) => [1, 3, 5].includes(n), { message: 'Score must be 1, 3, or 5' }),
  page: z.string().min(1).max(500),
  wallet: z.string().max(100).optional(),
  visitorId: z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`feedback:${ip}`, 3, 3600) // 3 per hour
  if (!rl.success) {
    const res = apiError('Too many feedback submissions', 429)
    res.headers.set('Retry-After', String(Math.ceil((rl.resetMs - Date.now()) / 1000)))
    return res
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('Invalid JSON', 400)
  }

  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation error', 400, { details: parsed.error.flatten().fieldErrors })
  }

  const { score, page, wallet, visitorId } = parsed.data
  const userAgent = req.headers.get('user-agent') ?? undefined

  await prisma.feedback.create({
    data: { score, page, wallet, visitorId, userAgent },
  })

  trackEvent(page, 'feedback_submitted', { score })

  return NextResponse.json({ ok: true }, { status: 201 })
}
