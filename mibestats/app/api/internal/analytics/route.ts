import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * GET /api/internal/analytics
 *
 * Proxies Umami Cloud API to fetch site analytics.
 * Protected by INTERNAL_API_KEY / ADMIN_TOKEN.
 *
 * Query params:
 *   period = '24h' | '7d' | '30d' | '90d' (default '7d')
 */

const UMAMI_API = 'https://api.umami.is/v1'

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
  const allowed = [process.env.INTERNAL_API_KEY, process.env.ADMIN_TOKEN].filter(Boolean)

  if (allowed.length === 0 || !apiKey || !allowed.includes(apiKey)) {
    return apiError('Unauthorized', 401)
  }

  const rl = checkRateLimit(`internal-analytics:${getClientIp(req)}`, 30, 60)
  if (!rl.success) return apiError('Too many requests', 429)

  const umamiToken = process.env.UMAMI_API_KEY
  const websiteId = process.env.UMAMI_WEBSITE_ID

  if (!umamiToken || !websiteId) {
    return apiError('Umami not configured (UMAMI_API_KEY or UMAMI_WEBSITE_ID missing)', 503)
  }

  const period = req.nextUrl.searchParams.get('period') ?? '7d'
  const now = Date.now()
  const periodMs: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  }
  const startAt = now - (periodMs[period] ?? periodMs['7d'])
  const unit = period === '24h' ? 'hour' : 'day'

  const headers = { 'x-umami-api-key': umamiToken }
  const qs = `startAt=${startAt}&endAt=${now}`

  try {
    const [statsRes, pageviewsRes, pagesRes, referrersRes, browsersRes, osRes, countriesRes] = await Promise.all([
      fetch(`${UMAMI_API}/websites/${websiteId}/stats?${qs}`, { headers }),
      fetch(`${UMAMI_API}/websites/${websiteId}/pageviews?${qs}&unit=${unit}`, { headers }),
      fetch(`${UMAMI_API}/websites/${websiteId}/metrics?${qs}&type=url&limit=20`, { headers }),
      fetch(`${UMAMI_API}/websites/${websiteId}/metrics?${qs}&type=referrer&limit=10`, { headers }),
      fetch(`${UMAMI_API}/websites/${websiteId}/metrics?${qs}&type=browser&limit=10`, { headers }),
      fetch(`${UMAMI_API}/websites/${websiteId}/metrics?${qs}&type=os&limit=10`, { headers }),
      fetch(`${UMAMI_API}/websites/${websiteId}/metrics?${qs}&type=country&limit=10`, { headers }),
    ])

    // Check if any failed
    if (!statsRes.ok) {
      const text = await statsRes.text()
      return apiError(`Umami API error: ${statsRes.status} ${text}`, 502)
    }

    const [stats, pageviews, pages, referrers, browsers, os, countries] = await Promise.all([
      statsRes.json(),
      pageviewsRes.ok ? pageviewsRes.json() : [],
      pagesRes.ok ? pagesRes.json() : [],
      referrersRes.ok ? referrersRes.json() : [],
      browsersRes.ok ? browsersRes.json() : [],
      osRes.ok ? osRes.json() : [],
      countriesRes.ok ? countriesRes.json() : [],
    ])

    return NextResponse.json({
      period,
      stats,
      pageviews,
      pages,
      referrers,
      browsers,
      os,
      countries,
    })
  } catch (err) {
    return apiError(`Umami fetch failed: ${(err as Error).message}`, 502)
  }
}
