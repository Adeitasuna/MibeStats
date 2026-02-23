import { clsx } from 'clsx'

interface StatCardProps {
  label:     string
  value:     string | null
  subvalue?: string
  className?: string
}

export function StatCard({ label, value, subvalue, className }: StatCardProps) {
  return (
    <div className={clsx('card p-4 flex flex-col gap-1', className)}>
      <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <span className="text-2xl font-bold text-white">
        {value ?? <span className="text-gray-600 animate-pulse">—</span>}
      </span>
      {subvalue && (
        <span className="text-xs text-gray-500">{subvalue}</span>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-2 animate-pulse">
      <div className="h-3 bg-white/5 rounded w-24" />
      <div className="h-7 bg-white/5 rounded w-32" />
    </div>
  )
}
