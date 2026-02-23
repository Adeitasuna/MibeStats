'use client'

export default function SalesError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-xl font-semibold text-red-400">Failed to load sales data</p>
      <p className="text-sm text-gray-400">Something went wrong fetching the sales history.</p>
      <button
        onClick={reset}
        className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
