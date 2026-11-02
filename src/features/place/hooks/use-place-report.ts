import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { PlaceReport, SearchedPlace } from "../types";

export function usePlaceReport(place: SearchedPlace | null) {
  return useQuery({
    queryKey: ["place", place?.latitude, place?.longitude, place?.quakeRadiusKm, place?.fireRadiusKm],
    enabled: place !== null,
    staleTime: 5 * 60_000,
    queryFn: () => {
      const p = place!;
      const q = new URLSearchParams({
        lat: p.latitude.toFixed(3),
        lon: p.longitude.toFixed(3),
        quakeKm: String(p.quakeRadiusKm),
        fireKm: String(p.fireRadiusKm),
      });
      return fetchJson<PlaceReport>(`/api/place?${q}`);
    },
  });
}
