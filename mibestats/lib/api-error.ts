import { NextResponse } from 'next/server'

/**
 * Standardized API error response.
 * Always returns `{ error: string, status: number }` with optional extra fields.
 */
export function apiError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, status, ...extra }, { status })
}
