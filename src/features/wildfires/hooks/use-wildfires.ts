import { useQuery } from "@tanstack/react-query";
import { fetchWildfires } from "../api";

export function useWildfires() {
  return useQuery({
    queryKey: ["wildfires"],
    queryFn: fetchWildfires,
    refetchInterval: 30 * 60_000,
  });
}
