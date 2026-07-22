import { useQuery } from "@tanstack/react-query";
import { fetchAirQuality } from "../api";

export function useAirQuality(lat: number, lon: number, active = true) {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;

  return useQuery({
    queryKey: ["air-quality", roundedLat, roundedLon],
    queryFn: () => fetchAirQuality(roundedLat, roundedLon),
    staleTime: 15 * 60_000,
    enabled: active,
  });
}
