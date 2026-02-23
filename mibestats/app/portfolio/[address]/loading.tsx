export default function PortfolioAddressLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="h-6 w-64 bg-white/5 animate-pulse rounded" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-4 h-20 bg-white/5 animate-pulse rounded" />
        ))}
      </div>

      {/* Token grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}
