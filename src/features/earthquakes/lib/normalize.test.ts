import { describe, expect, it } from "vitest";
import { normalizeEarthquakes } from "./normalize";

function makeFeature(overrides: Partial<{ mag: number | null; place: string | null; tsunami: number }> = {}) {
  return {
    id: "eq1",
    properties: {
      mag: 4.2,
      place: "10km N of Nowhere",
      time: 1700000000000,
      url: "https://example.com/eq1",
      tsunami: 0,
      ...overrides,
    },
    geometry: { type: "Point" as const, coordinates: [12.3, 45.6, 7.8] as [number, number, number] },
  };
}

describe("normalizeEarthquakes", () => {
  it("maps a USGS feature to our Earthquake shape", () => {
    const result = normalizeEarthquakes({
      metadata: { generated: 1700000001000 },
      features: [makeFeature()],
    });

    expect(result.generatedAt).toBe(new Date(1700000001000).toISOString());
    expect(result.quakes).toHaveLength(1);
    expect(result.quakes[0]).toMatchObject({
      id: "eq1",
      magnitude: 4.2,
      place: "10km N of Nowhere",
      longitude: 12.3,
      latitude: 45.6,
      depthKm: 7.8,
      tsunami: false,
    });
  });

  it("skips features with a null magnitude", () => {
    const result = normalizeEarthquakes({
      metadata: { generated: 1700000001000 },
      features: [makeFeature({ mag: null })],
    });

    expect(result.quakes).toHaveLength(0);
  });

  it("falls back to a placeholder place name when place is null", () => {
    const result = normalizeEarthquakes({
      metadata: { generated: 1700000001000 },
      features: [makeFeature({ place: null })],
    });

    expect(result.quakes[0].place).toBe("Unknown location");
  });

  it("maps tsunami flag 1 to true", () => {
    const result = normalizeEarthquakes({
      metadata: { generated: 1700000001000 },
      features: [makeFeature({ tsunami: 1 })],
    });

    expect(result.quakes[0].tsunami).toBe(true);
  });
});
