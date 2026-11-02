export function TripSkeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Checking sources for this trip" className="flex flex-col gap-4">
      <div className="dock-panel rounded-2xl p-6">
        <div className="skeleton-shimmer h-3 w-40 rounded bg-surface-elevated" />
        <div className="skeleton-shimmer mt-4 h-7 w-2/3 rounded bg-surface-elevated" />
        <div className="mt-5 space-y-2.5">
          <div className="skeleton-shimmer h-3 w-full rounded bg-surface-elevated" />
          <div className="skeleton-shimmer h-3 w-5/6 rounded bg-surface-elevated" />
        </div>
        <p className="mt-5 text-xs text-muted">Checking government advisories, health notices, live hazards and the forecast…</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dock-panel rounded-2xl p-5">
            <div className="skeleton-shimmer h-4 w-1/3 rounded bg-surface-elevated" />
            <div className="mt-5 space-y-2.5">
              <div className="skeleton-shimmer h-3 w-full rounded bg-surface-elevated" />
              <div className="skeleton-shimmer h-3 w-4/5 rounded bg-surface-elevated" />
              <div className="skeleton-shimmer h-3 w-2/3 rounded bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
