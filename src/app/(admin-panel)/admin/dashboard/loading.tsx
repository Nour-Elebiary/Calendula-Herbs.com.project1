export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded bg-black/[0.05]" />
        <div className="h-4 w-48 rounded bg-black/[0.05]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-5 space-y-4">
            <div className="h-4 w-24 rounded bg-black/[0.05]" />
            <div className="h-8 w-16 rounded bg-black/[0.08]" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-5 h-64">
        <div className="h-5 w-32 rounded bg-black/[0.05] mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-black/[0.02]" />
          ))}
        </div>
      </div>
    </div>
  )
}
