import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { FlightTrack } from "../types";

/** Tracks one flight, and keeps re-checking every 20 seconds while it is in the air. */
export function useFlightTrack(query: string | null) {
  return useQuery({
    queryKey: ["flight-track", query],
    queryFn: () => fetchJson<FlightTrack>(`/api/flights/track?q=${encodeURIComponent(query!)}`),
    enabled: query !== null,
    refetchInterval: (q) => (q.state.data?.status === "airborne" ? 20_000 : false),
    staleTime: 10_000,
    retry: 1,
  });
}
