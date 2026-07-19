import "server-only";
import { normalizeAirQuality } from "./normalize";
import type { AirQualityResponse } from "../types";

const CURRENT_PARAMS = [
  "us_aqi",
  "pm2_5",
  "pm10",
  "ozone",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "carbon_monoxide",
].join(",");

export async function fetchAirQualityData(lat: number, lon: number): Promise<AirQualityResponse | null> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=${CURRENT_PARAMS}&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) return null;

  const raw = await res.json();
  return normalizeAirQuality(raw);
}
