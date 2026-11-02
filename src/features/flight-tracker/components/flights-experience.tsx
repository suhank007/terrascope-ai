"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Plane, RefreshCw } from "lucide-react";
import { TravelShell } from "@/features/travel/components/travel-shell";
import { useFlightTrack } from "../hooks/use-flight-track";
import { parseFlightQuery } from "../lib/query";
import { FlightResult } from "./flight-result";
import { FlightSearch } from "./flight-search";

export function FlightsExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("q") ?? "";
  const parsed = raw ? parseFlightQuery(raw) : null;
  const query = parsed?.text ?? null;

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useFlightTrack(query);

  const onSearch = useCallback((q: string) => router.replace(`/flights?q=${encodeURIComponent(q)}`, { scroll: false }), [router]);

  return (
    <TravelShell
      icon={Plane}
      title="Flights"
      intro="Track a flight live: where it is, how high, how fast, and how far it has left to go. Works for any flight in the air with an ADS-B transponder."
    >
      <FlightSearch key={query ?? "empty"} initial={query ?? ""} onSearch={onSearch} />

      {raw && !parsed ? (
        <p role="alert" className="text-sm text-danger">
          &ldquo;{raw.slice(0, 20)}&rdquo; doesn&apos;t look like a flight number, callsign or registration.
        </p>
      ) : query === null ? (
        <p className="text-sm text-muted">Enter a flight to see it live. Position updates every 20 seconds while it&apos;s in the air.</p>
      ) : isLoading ? (
        <div role="status" aria-busy="true" aria-label="Looking up the flight" className="dock-panel rounded-2xl p-6">
          <div className="skeleton-shimmer h-9 w-40 rounded bg-surface-elevated" />
          <div className="skeleton-shimmer mt-6 h-2 w-full rounded bg-surface-elevated" />
          <p className="mt-5 text-xs text-muted">Looking for {query}…</p>
        </div>
      ) : isError || !data ? (
        <div role="alert" className="dock-panel flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
          <AlertCircle className="h-6 w-6 text-alert" aria-hidden />
          <p className="text-base font-medium text-foreground">Couldn&apos;t look up this flight</p>
          <p className="max-w-md text-sm text-muted">The flight data services didn&apos;t respond. They limit how often they can be asked, so wait a few seconds.</p>
          <button type="button" onClick={() => void refetch()} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95">
            <RefreshCw className="h-4 w-4" aria-hidden /> Try again
          </button>
        </div>
      ) : (
        <>
          <FlightResult track={data} />
          {data.status === "airborne" && dataUpdatedAt > 0 && (
            <p className="text-xs text-muted">Refreshes automatically every 20 seconds while the flight is in the air.</p>
          )}
        </>
      )}
    </TravelShell>
  );
}
