import { describe, expect, it } from "vitest";
import { clampBboxSpan } from "./clamp-bbox";

describe("clampBboxSpan", () => {
  it("leaves a small bbox unchanged", () => {
    const bbox = { west: 2.22, south: 48.81, east: 2.47, north: 48.9 };
    expect(clampBboxSpan(bbox)).toEqual(bbox);
  });

  it("clamps a bbox spanning overseas territories (e.g. France) to a country-sized window centered on it", () => {
    // Real Nominatim bbox for France, which includes French Polynesia.
    const bbox = { west: -178.39, south: -50.22, east: 172.31, north: 51.31 };
    const clamped = clampBboxSpan(bbox);

    expect(clamped.east - clamped.west).toBeLessThanOrEqual(40);
    expect(clamped.north - clamped.south).toBeLessThanOrEqual(40);
    // Still centered near mainland France, not the whole globe.
    expect((clamped.west + clamped.east) / 2).toBeCloseTo((bbox.west + bbox.east) / 2, 5);
  });

  it("clamps to valid coordinate ranges near the poles/antimeridian", () => {
    const clamped = clampBboxSpan({ west: 170, south: 80, east: -170, north: 90 });
    expect(clamped.west).toBeGreaterThanOrEqual(-180);
    expect(clamped.east).toBeLessThanOrEqual(180);
    expect(clamped.north).toBeLessThanOrEqual(90);
  });
});
