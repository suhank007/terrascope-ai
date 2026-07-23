"use client";

import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";

export type LiveStatus = "connecting" | "live" | "updating";

/**
 * Reads the same earthquake/wildfire queries KpiTicker and AlertsBell
 * already subscribe to (React Query dedupes by key, so this adds no extra
 * requests) and reduces them to one honest status: still connecting on
 * first load, briefly "updating" during a background refetch, "live"
 * otherwise.
 */
export function useLiveStatus(): LiveStatus {
  const earthquakes = useEarthquakes();
  const wildfires = useWildfires();

  if (earthquakes.isLoading || wildfires.isLoading) return "connecting";
  if (earthquakes.isFetching || wildfires.isFetching) return "updating";
  return "live";
}
