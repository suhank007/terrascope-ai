import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { apiParams, type TripQuery } from "../lib/query";
import type { Section, Sight, TripBrief } from "../types";

export function useTripBrief(query: TripQuery | null) {
  return useQuery({
    queryKey: ["trip", query && apiParams(query).toString()],
    queryFn: () => fetchJson<TripBrief>(`/api/trip?${apiParams(query!).toString()}`),
    enabled: query !== null,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useTripSights(query: TripQuery | null) {
  return useQuery({
    queryKey: ["trip-sights", query && `${query.cc}|${query.lat}|${query.lon}`],
    queryFn: () => {
      const params = new URLSearchParams({ name: query!.name, cc: query!.cc, lat: String(query!.lat), lon: String(query!.lon) });
      return fetchJson<Section<Sight[]>>(`/api/trip/sights?${params.toString()}`);
    },
    enabled: query !== null,
    staleTime: 60 * 60_000,
    retry: 1,
  });
}
