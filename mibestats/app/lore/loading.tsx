export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Lore Documents section */}
      <section>
        <div className="h-6 bg-white/5 rounded w-24 mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 flex flex-col gap-2 animate-pulse">
              <div className="h-5 bg-white/5 rounded w-40" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Fractures section */}
      <section>
        <div className="h-6 bg-white/5 rounded w-64 mb-4 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-80 mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card p-3 flex flex-col gap-2 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-white/5 rounded w-16" />
                <div className="h-3 bg-white/5 rounded w-8" />
              </div>
              <div className="h-4 bg-white/5 rounded w-28" />
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-2 bg-white/5 rounded w-48" />
            </div>
          ))}
        </div>
      </section>

      {/* TOR section */}
      <section>
        <div className="h-6 bg-white/5 rounded w-24 mb-4 animate-pulse" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card px-4 py-2 h-9 w-32 animate-pulse bg-white/5 rounded" />
          ))}
        </div>
      </section>

      {/* FBI Fugitives section */}
      <section>
        <div className="h-6 bg-white/5 rounded w-72 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card p-3 flex flex-col items-center gap-2 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-white/5" />
              <div className="h-3 bg-white/5 rounded w-20" />
              <div className="h-2 bg-white/5 rounded w-16" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
