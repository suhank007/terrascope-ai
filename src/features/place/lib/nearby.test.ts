import { describe, expect, it } from "vitest";
import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";
import { nearbyFires, nearbyQuakes } from "./nearby";
import { placeFromResult } from "./radius";

const LISBON = { latitude: 38.72, longitude: -9.14 };

const quake = (id: string, magnitude: number, latitude: number, longitude: number): Earthquake => ({
  id, magnitude, place: id, time: "2026-11-02T00:00:00Z", latitude, longitude, depthKm: 10, url: "", tsunami: false,
});
const fire = (id: string, frp: number, latitude: number, longitude: number): WildfireHotspot => ({
  id, frp, latitude, longitude, brightnessK: 330, confidence: "high", acquiredAt: "2026-11-02T00:00:00Z", satellite: "N",
});

describe("nearbyQuakes", () => {
  it("keeps only quakes inside the radius, strongest first", () => {
    const result = nearbyQuakes(LISBON, [quake("far", 7, 35, 139), quake("a", 3, 38.9, -9.2), quake("b", 4.2, 38.5, -9.5)], 300);
    expect(result.total).toBe(2);
    expect(result.quakes.map((q) => q.id)).toEqual(["b", "a"]);
    expect(result.strongest).toBe(4.2);
  });

  it("reports an empty area as zero, not null totals", () => {
    const result = nearbyQuakes(LISBON, [quake("far", 7, 35, 139)], 300);
    expect(result).toMatchObject({ total: 0, strongest: null, quakes: [] });
  });

  it("lists at most ten but counts them all", () => {
    const many = Array.from({ length: 14 }, (_, i) => quake(`q${i}`, 2.5 + i / 10, 38.8, -9.1));
    const result = nearbyQuakes(LISBON, many, 300);
    expect(result.total).toBe(14);
    expect(result.quakes).toHaveLength(10);
  });
});

describe("nearbyFires", () => {
  it("finds the nearest and the most intense detection", () => {
    const result = nearbyFires(LISBON, [fire("a", 5, 38.9, -9.1), fire("b", 40, 39.3, -9.1), fire("far", 99, 0, 0)], 100);
    expect(result.total).toBe(2);
    expect(result.nearestKm).toBeLessThan(25);
    expect(result.strongestFrp).toBe(40);
    expect(result.fires[0].id).toBe("b");
  });
});

describe("placeFromResult", () => {
  const base = { id: 1, name: "X", displayName: "X, Y", countryCode: null, countryName: null };

  it("uses the local radii for a city", () => {
    const place = placeFromResult({ ...base, ...LISBON, category: "city", bbox: { west: -9.3, east: -9.0, south: 38.6, north: 38.8 } });
    expect(place).toMatchObject({ scope: "city", quakeRadiusKm: 300, fireRadiusKm: 100 });
  });

  it("caps a country at 1000 km even when its bounding box spans the Pacific", () => {
    const france = placeFromResult({ ...base, latitude: 46.6, longitude: 2.2, category: "country", bbox: { west: -178, east: 172, south: -50, north: 51 } });
    expect(france).toMatchObject({ scope: "region", quakeRadiusKm: 1000, fireRadiusKm: 1000 });
  });

  it("keeps a prefecture with far islands local instead of 1,200 km wide", () => {
    const tokyo = placeFromResult({ ...base, latitude: 35.68, longitude: 139.76, category: "province", bbox: { west: 135.8, east: 154.2, south: 20.2, north: 35.9 } });
    expect(tokyo.scope).toBe("region");
    expect(tokyo.quakeRadiusKm).toBe(400);
  });

  it("never goes below the city radii for a small region", () => {
    const small = placeFromResult({ ...base, latitude: 47, longitude: 8, category: "county", bbox: { west: 8, east: 8.2, south: 47, north: 47.2 } });
    expect(small).toMatchObject({ scope: "region", quakeRadiusKm: 300, fireRadiusKm: 100 });
  });

  it("falls back to the box when the geocoder gave no type", () => {
    const wide = placeFromResult({ ...base, ...LISBON, category: null, bbox: { west: -12, east: -6, south: 36, north: 42 } });
    expect(wide.scope).toBe("region");
    expect(placeFromResult({ ...base, ...LISBON, category: null, bbox: null }).scope).toBe("city");
  });
});

import { aqiAdvice, compassPoint, fireIntensity, quakeFeel } from "./advice";

describe("advice", () => {
  it("maps wind degrees to compass points across the 360 wrap", () => {
    expect(compassPoint(0)).toBe("N");
    expect(compassPoint(359)).toBe("N");
    expect(compassPoint(90)).toBe("E");
    expect(compassPoint(225)).toBe("SW");
  });

  it("gives a distinct sentence at each AQI band edge", () => {
    const sentences = [50, 100, 150, 200, 300, 301].map(aqiAdvice);
    expect(new Set(sentences).size).toBe(6);
  });

  it("describes quakes and fires by size", () => {
    expect(quakeFeel(2.6)).toBe("Rarely felt");
    expect(quakeFeel(7.1)).toMatch(/Major/);
    expect(fireIntensity(5)).toBe("Small");
    expect(fireIntensity(200)).toBe("Very intense");
  });
});
