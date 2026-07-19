import { describe, expect, it } from "vitest";
import { normalizeAirQuality } from "./normalize";

describe("normalizeAirQuality", () => {
  it("maps an Open-Meteo air quality response to our shape", () => {
    const result = normalizeAirQuality({
      latitude: 39.9,
      longitude: 116.4,
      current: {
        time: "2026-07-19T12:00",
        us_aqi: 168,
        pm2_5: 92.3,
        pm10: 110.5,
        ozone: 40,
        nitrogen_dioxide: 22,
        sulphur_dioxide: 8,
        carbon_monoxide: 300,
      },
    });

    expect(result.current).toMatchObject({
      latitude: 39.9,
      longitude: 116.4,
      observedAt: "2026-07-19T12:00",
      usAqi: 168,
      pm2_5: 92.3,
      pm10: 110.5,
      ozone: 40,
      nitrogenDioxide: 22,
      sulphurDioxide: 8,
      carbonMonoxide: 300,
    });
  });
});
