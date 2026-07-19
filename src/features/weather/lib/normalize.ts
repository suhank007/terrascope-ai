import type { WeatherResponse } from "../types";

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
}

export function normalizeWeather(raw: OpenMeteoResponse): WeatherResponse {
  const { current } = raw;
  return {
    current: {
      latitude: raw.latitude,
      longitude: raw.longitude,
      timezone: raw.timezone,
      observedAt: current.time,
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature,
      humidityPct: current.relative_humidity_2m,
      precipitationMm: current.precipitation,
      windSpeedKph: current.wind_speed_10m,
      windDirectionDeg: current.wind_direction_10m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
    },
  };
}
