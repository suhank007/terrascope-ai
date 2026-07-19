import { useQuery } from "@tanstack/react-query";
import { fetchEarthquakes } from "../api";

export function useEarthquakes() {
  return useQuery({
    queryKey: ["earthquakes"],
    queryFn: fetchEarthquakes,
    refetchInterval: 60_000,
  });
}
