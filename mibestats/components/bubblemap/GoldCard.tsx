export function GoldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="card-title-upper">{label}</span>
      <div className="stat-card stat-card--gold">
        <span className="text-xl font-bold text-white">{value}</span>
      </div>
    </div>
  )
}
