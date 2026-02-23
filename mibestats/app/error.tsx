'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-4xl font-bold text-red-400">Something went wrong</p>
      <p className="text-gray-400 max-w-md">
        {error.message ?? 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
