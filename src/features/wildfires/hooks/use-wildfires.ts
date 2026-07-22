import { useQuery } from "@tanstack/react-query";
import { fetchWildfires } from "../api";

export function useWildfires(active = true) {
  return useQuery({
    queryKey: ["wildfires"],
    queryFn: fetchWildfires,
    refetchInterval: 30 * 60_000,
    enabled: active,
  });
}
