import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { BoardRow } from "@/features/airports/types";

export function useAirportBoard() {
  return useQuery({
    queryKey: ["landing-board"],
    queryFn: () => fetchJson<{ generatedAt: string; rows: BoardRow[] }>("/api/landing/board"),
    staleTime: 2 * 60_000,
    refetchInterval: 2 * 60_000,
    retry: 1,
  });
}
