export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className="card aspect-square animate-pulse bg-white/5 rounded" />
        ))}
      </div>
    </div>
  )
}
