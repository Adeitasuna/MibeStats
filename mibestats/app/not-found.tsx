import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <span className="text-6xl">🐻</span>
      <h1 className="text-2xl font-bold text-white">404 — Not Found</h1>
      <p className="text-gray-500">This Mibera wandered too far in Kaironic time.</p>
      <Link
        href="/"
        className="mt-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition-colors"
      >
        Back to Overview
      </Link>
    </div>
  )
}
