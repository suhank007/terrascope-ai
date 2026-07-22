import { useQuery } from "@tanstack/react-query";
import { fetchGeocode } from "../api";

export function useGeocodeSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["geocode", trimmed],
    queryFn: () => fetchGeocode(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
  });
}
