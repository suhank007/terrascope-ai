export function TripSkeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Checking sources for this trip" className="flex flex-col gap-8">
      <div className="dock-panel rounded-2xl p-6">
        <div className="skeleton-shimmer h-4 w-32 rounded bg-surface-elevated" />
        <div className="skeleton-shimmer mt-4 h-6 w-2/3 rounded bg-surface-elevated" />
        <div className="mt-5 space-y-2.5">
          <div className="skeleton-shimmer h-3.5 w-full rounded bg-surface-elevated" />
          <div className="skeleton-shimmer h-3.5 w-5/6 rounded bg-surface-elevated" />
        </div>
        <p className="mt-5 text-xs text-muted">Checking government advisories, health notices, live hazards and the forecast.</p>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-t border-border pt-8">
          <div className="skeleton-shimmer h-4 w-1/4 rounded bg-surface-elevated" />
          <div className="mt-5 space-y-2.5">
            <div className="skeleton-shimmer h-3.5 w-full rounded bg-surface-elevated" />
            <div className="skeleton-shimmer h-3.5 w-3/4 rounded bg-surface-elevated" />
          </div>
        </div>
      ))}
    </div>
  );
}
