import { fetchJson } from "@/lib/fetcher";
import type { AirQualityResponse } from "./types";

export function fetchAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
  const params = new URLSearchParams({ lat: lat.toFixed(4), lon: lon.toFixed(4) });
  return fetchJson<AirQualityResponse>(`/api/air-quality?${params.toString()}`);
}
