import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { apiError } from '@/lib/api-error'

/**
 * GET /api/internal/stats
 *
 * Protected internal endpoint — requires INTERNAL_API_KEY header.
 * Returns NPS summary, bug report stats, and daily submission counts.
 */
export async function GET(req: NextRequest) {
  // Accept both x-api-key header and Bearer token (unified admin auth)
  const apiKey = req.headers.get('x-api-key')
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
  const allowed = [process.env.INTERNAL_API_KEY, process.env.ADMIN_TOKEN].filter(Boolean)

  if (allowed.length === 0 || !apiKey || !allowed.includes(apiKey)) {
    return apiError('Unauthorized', 401)
  }

  const [
    bugReportCount,
    recentFeedback,
    recentBugs,
    feedbackAll,
  ] = await Promise.all([
    prisma.bugReport.count(),
    prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, score: true, page: true, wallet: true, visitorId: true, createdAt: true },
    }),
    prisma.bugReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true, description: true, page: true, createdAt: true, viewport: true, status: true,
        gitHash: true, screenshotB64: true, consoleErrors: true, wallet: true, visitorId: true, userAgent: true,
      },
    }),
    prisma.feedback.findMany({
      select: { score: true },
    }),
  ])

  // NPS calculation: promoters (9-10) - detractors (0-6) as % of total
  const total = feedbackAll.length
  let npsScore = 0
  let promoters = 0
  let passives = 0
  let detractors = 0

  if (total > 0) {
    for (const f of feedbackAll) {
      if (f.score >= 9) promoters++
      else if (f.score >= 7) passives++
      else detractors++
    }
    npsScore = Math.round(((promoters - detractors) / total) * 100)
  }

  const avgScore = total > 0
    ? Math.round((feedbackAll.reduce((sum, f) => sum + f.score, 0) / total) * 10) / 10
    : 0

  // Daily submissions (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [recentFeedbackCount, recentBugCount] = await Promise.all([
    prisma.feedback.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.bugReport.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ])

  return NextResponse.json({
    nps: {
      score: npsScore,
      avgScore,
      total,
      promoters,
      passives,
      detractors,
      recent: recentFeedback.map((f) => ({
        ...f,
        id: f.id.toString(),
      })),
    },
    bugs: {
      total: bugReportCount,
      recent: recentBugs.map((b) => ({
        ...b,
        id: b.id.toString(),
      })),
    },
    daily: {
      feedback: recentFeedbackCount,
      bugs: recentBugCount,
    },
  })
}
