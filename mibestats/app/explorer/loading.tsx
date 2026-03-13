export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Token ID selector skeleton */}
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-5 bg-white/5 rounded w-20" />
        <div className="h-8 bg-white/5 rounded w-28" />
        <div className="h-8 bg-white/5 rounded w-14" />
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-white/5 rounded" />
          <div className="h-8 w-8 bg-white/5 rounded" />
          <div className="h-8 w-10 bg-white/5 rounded" />
        </div>
      </div>

      {/* Token display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Image + quick stats */}
        <div className="flex flex-col gap-4">
          {/* Token image */}
          <div className="card p-2 aspect-square bg-white/5 animate-pulse rounded-xl" />

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-3 flex flex-col gap-2 animate-pulse">
                <div className="h-3 bg-white/5 rounded w-16" />
                <div className="h-5 bg-white/5 rounded w-24" />
              </div>
            ))}
          </div>

          {/* MagicEden link */}
          <div className="card px-4 py-2 h-9 bg-white/5 animate-pulse rounded" />
        </div>

        {/* Right column: Metadata grid */}
        <div className="lg:col-span-2">
          <div className="h-6 bg-white/5 rounded w-40 mb-4 animate-pulse" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="card p-3 flex flex-col gap-1 animate-pulse">
                <div className="h-2 bg-white/5 rounded w-20" />
                <div className="h-4 bg-white/5 rounded w-28" />
              </div>
            ))}
          </div>

          {/* Sales history table skeleton */}
          <div className="mt-6">
            <div className="h-5 bg-white/5 rounded w-32 mb-3 animate-pulse" />
            <div className="card overflow-hidden animate-pulse">
              <div className="h-10 bg-white/5 border-b border-mibe-border" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/[0.02] border-b border-mibe-border/50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
