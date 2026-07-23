"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <div className="glass-panel flex h-16 w-16 items-center justify-center rounded-2xl">
          <TriangleAlert className="h-7 w-7 text-alert" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Something went wrong</p>
          <h1 className="text-xl font-semibold text-foreground">The globe hit turbulence</h1>
          <p className="max-w-sm text-sm text-muted">
            An unexpected error interrupted this view. Try again, or head back to the globe.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition hover:bg-accent-strong active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground active:scale-95"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
