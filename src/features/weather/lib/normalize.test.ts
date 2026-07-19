import { describe, expect, it } from "vitest";
import { normalizeWeather } from "./normalize";

describe("normalizeWeather", () => {
  it("maps an Open-Meteo response to our WeatherSnapshot shape", () => {
    const result = normalizeWeather({
      latitude: 48.85,
      longitude: 2.35,
      timezone: "Europe/Paris",
      current: {
        time: "2026-07-19T12:00",
        temperature_2m: 21.4,
        relative_humidity_2m: 55,
        apparent_temperature: 20.1,
        precipitation: 0,
        weather_code: 2,
        wind_speed_10m: 12.5,
        wind_direction_10m: 270,
        is_day: 1,
      },
    });

    expect(result.current).toMatchObject({
      latitude: 48.85,
      longitude: 2.35,
      timezone: "Europe/Paris",
      observedAt: "2026-07-19T12:00",
      temperatureC: 21.4,
      apparentTemperatureC: 20.1,
      humidityPct: 55,
      windSpeedKph: 12.5,
      windDirectionDeg: 270,
      weatherCode: 2,
      isDay: true,
    });
  });

  it("maps is_day 0 to false", () => {
    const result = normalizeWeather({
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
      current: {
        time: "2026-07-19T00:00",
        temperature_2m: 10,
        relative_humidity_2m: 80,
        apparent_temperature: 9,
        precipitation: 1,
        weather_code: 61,
        wind_speed_10m: 5,
        wind_direction_10m: 0,
        is_day: 0,
      },
    });

    expect(result.current.isDay).toBe(false);
  });
});
