export default function SalesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-white/5 animate-pulse rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4 h-[280px] bg-white/5 animate-pulse rounded" />
        <div className="card p-4 h-[210px] bg-white/5 animate-pulse rounded" />
      </div>
      <div className="card p-4 space-y-3">
        <div className="h-6 w-32 bg-white/5 animate-pulse rounded" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-white/5 animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}
