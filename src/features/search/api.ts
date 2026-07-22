import { fetchJson } from "@/lib/fetcher";
import type { GeocodeResponse } from "./types";

export function fetchGeocode(query: string): Promise<GeocodeResponse> {
  return fetchJson<GeocodeResponse>(`/api/search?q=${encodeURIComponent(query)}`);
}
