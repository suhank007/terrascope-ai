import { fetchJson } from "@/lib/fetcher";
import type { EarthquakesResponse } from "./types";

export function fetchEarthquakes(): Promise<EarthquakesResponse> {
  return fetchJson<EarthquakesResponse>("/api/earthquakes");
}
