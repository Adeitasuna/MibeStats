export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Grails grid — 7 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            {/* Category label */}
            <div className="px-2 pt-2">
              <div className="h-2 bg-white/5 rounded w-16" />
            </div>
            {/* Image placeholder */}
            <div className="aspect-square m-1.5 rounded-lg bg-white/5" />
            {/* Info */}
            <div className="p-2 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-white/5 rounded w-20" />
                <div className="h-4 w-4 bg-white/5 rounded-full" />
              </div>
              <div className="flex justify-between">
                <div className="h-2 bg-white/5 rounded w-10" />
                <div className="h-2 bg-white/5 rounded w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* By Category view */}
      <div className="flex flex-col gap-8 mt-4">
        <div className="h-6 bg-white/5 rounded w-32 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-white/5 rounded w-40 mb-3 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="card overflow-hidden animate-pulse">
                  <div className="aspect-square m-1 rounded-lg bg-white/5" />
                  <div className="p-2">
                    <div className="h-3 bg-white/5 rounded w-16 mb-1" />
                    <div className="h-2 bg-white/5 rounded w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
