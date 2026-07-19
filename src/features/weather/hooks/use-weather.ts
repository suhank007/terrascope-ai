import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../api";

export function useWeather(lat: number, lon: number) {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;

  return useQuery({
    queryKey: ["weather", roundedLat, roundedLon],
    queryFn: () => fetchWeather(roundedLat, roundedLon),
    staleTime: 10 * 60_000,
  });
}
