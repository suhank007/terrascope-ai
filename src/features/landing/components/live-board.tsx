"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAirportBoard } from "../hooks/use-airport-board";

const DOT = { none: "bg-success", caution: "bg-alert", high: "bg-danger", critical: "bg-danger" } as const;
const TEXT = { none: "text-foreground", caution: "text-alert", high: "text-danger", critical: "text-danger" } as const;

export function LiveBoard() {
  const { data, isLoading, isError, refetch } = useAirportBoard();

  return (
    <section id="board" aria-labelledby="board-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="board-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Airports right now
          </h2>
          <p className="mt-1 text-base text-muted">Weather from NOAA, delays and flight holds from the FAA (US airports only).</p>
        </div>
        <p className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-alert" aria-hidden />
            Possible delays
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" aria-hidden />
            Likely delays
          </span>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]">
        {isLoading ? (
          <ul aria-busy="true" aria-label="Loading airport conditions" className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4" aria-hidden>
                <span className="h-4 w-10 animate-pulse rounded bg-surface-elevated" />
                <span className="h-3 w-1/3 animate-pulse rounded bg-surface-elevated" />
              </li>
            ))}
          </ul>
        ) : isError || !data ? (
          <div role="alert" className="px-5 py-12 text-center">
            <p className="text-base text-foreground">The live board couldn&apos;t be loaded right now.</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 min-h-11 text-sm font-medium text-accent hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.rows.map((row) => (
              <li key={row.iata}>
                <Link
                  href={`/airports/${row.iata}`}
                  className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-x-4 gap-y-0.5 px-5 py-4 transition-colors hover:bg-surface sm:grid-cols-[3.5rem_10rem_1fr_auto]"
                >
                  <span className="font-mono text-base font-semibold">{row.iata}</span>
                  <span className="truncate text-base text-muted">{row.city}</span>
                  <span className="col-start-2 col-end-4 row-start-2 min-w-0 sm:col-auto sm:row-auto">
                    <span className={cn("flex items-center gap-2 text-base", TEXT[row.level])}>
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[row.level])} aria-hidden />
                      {row.headline}
                    </span>
                    {row.reason && <span className="mt-0.5 line-clamp-1 block text-sm text-muted">{row.reason}</span>}
                  </span>
                  <span className="row-start-1 justify-self-end font-mono text-sm text-muted sm:row-auto">{row.category ?? "n/a"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {data && (
        <p className="mt-3 text-sm text-muted">
          Checked {formatRelativeTime(data.generatedAt)}. Outside the US the outlook is weather only, because no free public delay feed exists. Select an airport for the full report.
        </p>
      )}
    </section>
  );
}
