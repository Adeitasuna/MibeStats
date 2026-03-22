import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { apiError } from '@/lib/api-error'
import { trackEvent } from '@/lib/analytics'

const MAX_SCREENSHOT_BYTES = 500 * 1024 // 500KB in base64
const PNG_B64_PREFIX = 'data:image/png;base64,'

const bugReportSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  screenshot: z.string().max(MAX_SCREENSHOT_BYTES + PNG_B64_PREFIX.length).optional(),
  consoleErrors: z.array(z.string().max(500)).max(20).optional(),
  page: z.string().min(1).max(500),
  viewport: z.string().max(20).optional(),
  wallet: z.string().max(100).optional(),
  visitorId: z.string().max(100).optional(),
})

/**
 * Validate that a base64 string is actually a PNG image.
 * Checks the magic bytes: PNG files start with iVBOR in base64.
 */
function isValidPngBase64(b64: string): boolean {
  const raw = b64.startsWith(PNG_B64_PREFIX) ? b64.slice(PNG_B64_PREFIX.length) : b64
  return raw.startsWith('iVBOR')
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`bug-report:${ip}`, 5, 3600) // 5 per hour
  if (!rl.success) {
    const res = apiError('Too many bug reports', 429)
    res.headers.set('Retry-After', String(Math.ceil((rl.resetMs - Date.now()) / 1000)))
    return res
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('Invalid JSON', 400)
  }

  const parsed = bugReportSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Validation error', 400, { details: parsed.error.flatten().fieldErrors })
  }

  const { description, screenshot, consoleErrors, page, viewport, wallet, visitorId } = parsed.data

  // Validate screenshot if provided
  let screenshotB64: string | undefined
  if (screenshot) {
    if (!isValidPngBase64(screenshot)) {
      return apiError('Screenshot must be a valid PNG image', 400)
    }
    const raw = screenshot.startsWith(PNG_B64_PREFIX) ? screenshot.slice(PNG_B64_PREFIX.length) : screenshot
    // Check decoded size (base64 is ~4/3 of original)
    if (raw.length > MAX_SCREENSHOT_BYTES) {
      return apiError('Screenshot too large (max 500KB)', 413)
    }
    screenshotB64 = raw
  }

  const userAgent = req.headers.get('user-agent') ?? undefined
  const gitHash = process.env.NEXT_PUBLIC_GIT_HASH ?? undefined

  await prisma.bugReport.create({
    data: {
      description, screenshotB64, page, wallet, visitorId, userAgent, viewport, gitHash,
      consoleErrors: consoleErrors?.length ? JSON.stringify(consoleErrors) : undefined,
    },
  })

  trackEvent(page, 'bug_report_submitted')

  // Optional webhook notification
  const webhookUrl = process.env.WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `**New Bug Report** on \`${page}\`\n> ${description.slice(0, 200)}${description.length > 200 ? '...' : ''}`,
        }),
      })
    } catch {
      console.warn('[bug-report] Webhook notification failed')
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
