import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { Airport, AirportBrief } from "../types";

export function useAirportBrief(code: string) {
  return useQuery({
    queryKey: ["airport", code.toUpperCase()],
    queryFn: () => fetchJson<AirportBrief>(`/api/airports/${encodeURIComponent(code)}`),
    staleTime: 60_000,
    // Conditions change by the minute, so keep a page that is left open honest.
    refetchInterval: 120_000,
    retry: 1,
  });
}

export function useAirportSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["airport-search", q],
    queryFn: () => fetchJson<{ results: Airport[] }>(`/api/airports/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
    staleTime: 60 * 60_000,
  });
}
