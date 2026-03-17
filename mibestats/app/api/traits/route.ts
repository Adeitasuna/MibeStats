import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/api-handler'
import { fetchTraitDistribution } from '@/lib/trait-distribution'

export const revalidate = 3600  // 1 hour — matches traits page ISR

export const GET = withRateLimit('traits', 100, async () => {
  const response = await fetchTraitDistribution()
  return NextResponse.json(response)
}, { cacheSecs: 3600 })
