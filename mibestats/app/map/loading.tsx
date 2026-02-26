export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Map area placeholder */}
      <div className="card animate-pulse" style={{ height: 600 }}>
        <div className="w-full h-full flex items-center justify-center bg-white/5 rounded">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 bg-white/5 rounded-full" />
            <div className="h-4 bg-white/5 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
