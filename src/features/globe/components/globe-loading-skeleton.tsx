export function GlobeLoadingSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/40" />
          <div className="absolute inset-3 animate-pulse-ring rounded-full border border-accent/60 [animation-delay:200ms]" />
          <div className="absolute inset-6 rounded-full bg-accent/20" />
        </div>
        <p className="text-sm tracking-wide text-muted">Initializing globe…</p>
      </div>
    </div>
  );
}
