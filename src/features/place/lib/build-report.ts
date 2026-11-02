import "server-only";
import { z } from "zod";
import { normalizeAirQuality } from "@/features/air-quality/lib/normalize";
import { aqiHexColor, aqiLabel } from "@/features/air-quality/lib/aqi-scale";
import { fetchEarthquakesData } from "@/features/earthquakes/lib/fetch-server";
import { fetchWildfiresData } from "@/features/wildfires/lib/fetch-server";
import { getJson } from "@/features/trip/lib/http";
import type { Section } from "@/features/trip/types";
import { nearbyFires, nearbyQuakes } from "./nearby";
import type { PlaceAirQuality, PlaceFires, PlaceQuakes, PlaceReport, PlaceWeather } from "../types";

export const placeParamsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  quakeKm: z.coerce.number().min(50).max(2000).default(300),
  fireKm: z.coerce.number().min(25).max(2000).default(100),
});
export type PlaceParams = z.infer<typeof placeParamsSchema>;

const unavailable = (reason: string): { status: "unavailable"; reason: string } => ({ status: "unavailable", reason });

interface OpenMeteoForecast {
  timezone?: string;
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
  };
}

async function fetchWeather(lat: number, lon: number): Promise<Section<PlaceWeather>> {
  const current = "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day";
  const daily = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max";
  const raw = await getJson<OpenMeteoForecast>(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${current}&daily=${daily}&timezone=auto&forecast_days=7`,
    600
  );
  const c = raw?.current;
  const d = raw?.daily;
  if (!raw || !c || !d?.time || !d.weather_code || !d.temperature_2m_max || !d.temperature_2m_min) {
    return unavailable("The weather service didn't respond.");
  }
  return {
    status: "ok",
    data: {
      observedAt: c.time,
      timezone: raw.timezone ?? "UTC",
      temperatureC: c.temperature_2m,
      apparentC: c.apparent_temperature,
      humidityPct: c.relative_humidity_2m,
      windKph: c.wind_speed_10m,
      windDirectionDeg: c.wind_direction_10m,
      precipitationMm: c.precipitation,
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
      days: d.time.map((date, i) => ({
        date,
        weatherCode: d.weather_code[i],
        maxC: d.temperature_2m_max[i],
        minC: d.temperature_2m_min[i],
        rainChancePct: d.precipitation_probability_max?.[i] ?? null,
        windMaxKph: d.wind_speed_10m_max?.[i] ?? null,
      })),
    },
  };
}

async function fetchAirQuality(lat: number, lon: number): Promise<Section<PlaceAirQuality>> {
  const params = "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide";
  const raw = await getJson<Parameters<typeof normalizeAirQuality>[0]>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=${params}&timezone=auto`,
    900
  );
  // Open-Meteo returns null readings where it has no model coverage.
  if (!raw?.current || typeof raw.current.us_aqi !== "number") return unavailable("No air quality reading is available for this location.");
  const parsed = normalizeAirQuality(raw);
  const c = parsed.current;
  return {
    status: "ok",
    data: {
      usAqi: c.usAqi,
      label: aqiLabel(c.usAqi),
      color: aqiHexColor(c.usAqi),
      observedAt: c.observedAt,
      pollutants: [
        { key: "pm2_5", label: "PM2.5", value: c.pm2_5, unit: "µg/m³" },
        { key: "pm10", label: "PM10", value: c.pm10, unit: "µg/m³" },
        { key: "ozone", label: "Ozone", value: c.ozone, unit: "µg/m³" },
        { key: "no2", label: "Nitrogen dioxide", value: c.nitrogenDioxide, unit: "µg/m³" },
        { key: "so2", label: "Sulphur dioxide", value: c.sulphurDioxide, unit: "µg/m³" },
        { key: "co", label: "Carbon monoxide", value: c.carbonMonoxide, unit: "µg/m³" },
      ],
    },
  };
}

async function fetchQuakes(center: { latitude: number; longitude: number }, radiusKm: number): Promise<Section<PlaceQuakes>> {
  try {
    const feed = await fetchEarthquakesData();
    return { status: "ok", data: nearbyQuakes(center, feed.quakes, radiusKm) };
  } catch {
    return unavailable("The USGS earthquake feed didn't respond.");
  }
}

async function fetchFires(center: { latitude: number; longitude: number }, radiusKm: number): Promise<Section<PlaceFires>> {
  try {
    const feed = await fetchWildfiresData();
    if (!feed.configured) return unavailable("Wildfire detection isn't configured on this server, so we can't say whether there are fires.");
    // The fetcher degrades to an empty list on a failed request; a world with no
    // detections at all means the feed failed, not that the planet is fire-free.
    if (feed.count === 0) return unavailable("The NASA fire feed returned nothing, so we can't say whether there are fires.");
    return { status: "ok", data: nearbyFires(center, feed.hotspots, radiusKm) };
  } catch {
    return unavailable("The NASA fire feed didn't respond.");
  }
}

export async function buildPlaceReport({ lat, lon, quakeKm, fireKm }: PlaceParams): Promise<PlaceReport> {
  const center = { latitude: lat, longitude: lon };
  const [weather, airQuality, earthquakes, wildfires] = await Promise.all([
    fetchWeather(lat, lon),
    fetchAirQuality(lat, lon),
    fetchQuakes(center, quakeKm),
    fetchFires(center, fireKm),
  ]);
  return { weather, airQuality, earthquakes, wildfires };
}
