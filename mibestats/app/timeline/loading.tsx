export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-64 mt-2 animate-pulse" />
      </div>

      {/* Treemap placeholder */}
      <div className="card p-8 h-[540px] animate-pulse">
        <div className="w-full h-full bg-white/5 rounded grid grid-cols-6 grid-rows-4 gap-1 p-2">
          {/* Simulate treemap blocks of varying sizes */}
          <div className="col-span-2 row-span-2 bg-white/[0.03] rounded" />
          <div className="col-span-1 row-span-2 bg-white/[0.03] rounded" />
          <div className="col-span-3 row-span-1 bg-white/[0.03] rounded" />
          <div className="col-span-2 row-span-1 bg-white/[0.03] rounded" />
          <div className="col-span-1 row-span-1 bg-white/[0.03] rounded" />
          <div className="col-span-3 row-span-2 bg-white/[0.03] rounded" />
          <div className="col-span-2 row-span-1 bg-white/[0.03] rounded" />
          <div className="col-span-1 row-span-1 bg-white/[0.03] rounded" />
        </div>
      </div>
    </div>
  )
}
