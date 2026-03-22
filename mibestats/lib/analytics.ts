/**
 * Umami server-side analytics.
 *
 * All tracking happens server-side via Umami's /api/send endpoint.
 * No client-side tracking script is injected — avoids ad-blockers
 * and keeps CSP clean.
 *
 * Requires env vars: UMAMI_HOST, UMAMI_WEBSITE_ID
 */

const UMAMI_HOST = process.env.UMAMI_HOST
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID

interface PageViewPayload {
  url: string
  referrer?: string
  language?: string
}

interface EventPayload {
  url: string
  name: string
  data?: Record<string, string | number | boolean>
}

function isConfigured(): boolean {
  return Boolean(UMAMI_HOST && UMAMI_WEBSITE_ID)
}

/**
 * Send a payload to the Umami collect endpoint.
 * Fire-and-forget — errors are logged but never thrown.
 */
async function send(payload: { type: 'event'; data: PageViewPayload | EventPayload }): Promise<void> {
  if (!isConfigured()) return

  try {
    const res = await fetch(`${UMAMI_HOST}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'MibeStats/1.0' },
      body: JSON.stringify({
        payload: {
          website: UMAMI_WEBSITE_ID,
          ...payload.data,
        },
        type: payload.type,
      }),
    })

    if (!res.ok) {
      console.warn(`[analytics] Umami responded ${res.status}`)
    }
  } catch (err) {
    console.warn('[analytics] Failed to send event:', (err as Error).message)
  }
}

/**
 * Track a page view (server-side).
 */
export function trackPageView(url: string, referrer?: string, language?: string): void {
  // Fire-and-forget — don't await in middleware to avoid blocking the response
  send({
    type: 'event',
    data: { url, ...(referrer && { referrer }), ...(language && { language }) },
  })
}

/**
 * Track a named event with optional data payload.
 */
export function trackEvent(url: string, name: string, data?: Record<string, string | number | boolean>): void {
  send({
    type: 'event',
    data: { url, name, ...(data && { data }) },
  })
}
