import "server-only";
import { normalizeWeather } from "./normalize";
import type { WeatherResponse } from "../types";

const CURRENT_PARAMS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "is_day",
].join(",");

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherResponse | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${CURRENT_PARAMS}&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return null;

  const raw = await res.json();
  return normalizeWeather(raw);
}
