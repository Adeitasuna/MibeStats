export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Pie chart grid — 24 categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="card p-4 h-[260px] animate-pulse">
            <div className="h-3 bg-white/5 rounded w-24 mb-3" />
            <div className="h-[200px] bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
