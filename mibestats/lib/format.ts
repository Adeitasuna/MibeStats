/**
 * Shared formatting utilities — addresses, dates, relative time.
 */

/** Truncate a hex address to `0x1234…abcd` form. */
export function truncateAddress(addr: string | null): string {
  if (!addr) return '—'
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/** Format an ISO date string as "Mar 5, 2026". */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

/** Relative time string: "5m ago", "2h ago", "3d ago". */
export function timeAgo(iso: string): string {
  const ms   = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
