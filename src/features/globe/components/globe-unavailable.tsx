import Link from "next/link";
import { Compass, Globe2, PlaneTakeoff } from "lucide-react";

/**
 * Shown in the map area when the 3D globe can't start (no WebGL, or it failed
 * to initialise). The layers, lists and place search beside it keep working,
 * so this says so and points at the tools that don't need the globe.
 */
export function GlobeUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="status" className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-surface px-6 py-10">
      <div className="w-full max-w-md text-center">
        <Globe2 className="mx-auto h-10 w-10 text-muted" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">The 3D globe isn&apos;t available here</h2>
        <p className="mt-2 text-base leading-relaxed text-muted">
          This browser or device can&apos;t run WebGL, which the globe needs. The layers, lists and place search on this page still work, and so do the travel tools.
        </p>
        <p className="mt-2 text-sm text-muted">If you expect it to work, turn on hardware acceleration in your browser settings and reload.</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link href="/trip" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-strong">
            <Compass className="h-4 w-4" aria-hidden />
            Trip Brief
          </Link>
          <Link href="/airports" className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated">
            <PlaneTakeoff className="h-4 w-4" aria-hidden />
            Airports
          </Link>
          {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-accent hover:underline">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
