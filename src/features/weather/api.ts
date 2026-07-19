import { fetchJson } from "@/lib/fetcher";
import type { WeatherResponse } from "./types";

export function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({ lat: lat.toFixed(4), lon: lon.toFixed(4) });
  return fetchJson<WeatherResponse>(`/api/weather?${params.toString()}`);
}
