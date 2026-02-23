export default function TraitsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-white/5 animate-pulse rounded" />
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 shrink-0">
          <div className="card p-4 h-96 bg-white/5 animate-pulse rounded" />
        </aside>
        <div className="flex-1 min-w-0 space-y-6">
          <div className="card p-4 h-48 bg-white/5 animate-pulse rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
