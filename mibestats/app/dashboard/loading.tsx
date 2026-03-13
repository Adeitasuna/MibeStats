export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Floor + All-time Volume gold cards */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-4 flex flex-col gap-2 animate-pulse">
            <div className="h-3 bg-white/5 rounded w-24" />
            <div className="h-7 bg-white/5 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Volume stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 flex flex-col gap-2 animate-pulse">
            <div className="h-3 bg-white/5 rounded w-20" />
            <div className="h-6 bg-white/5 rounded w-28" />
          </div>
        ))}
      </div>

      {/* Floor price chart placeholder */}
      <div className="card p-4 h-[240px] bg-white/5 animate-pulse rounded" />

      {/* Eden data section placeholder */}
      <div className="card p-6 h-[200px] bg-white/5 animate-pulse rounded" />

      {/* Recent + Top Sales feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-4 flex flex-col gap-3 animate-pulse">
            <div className="h-5 bg-white/5 rounded w-32" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-10 bg-white/5 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
