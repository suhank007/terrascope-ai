import { describe, expect, it } from "vitest";
import { bboxToPointRadius, capByCount, clampBbox, quantizeBbox } from "./sampling";
import type { Flight } from "../types";

describe("clampBbox", () => {
  it("returns the bbox unchanged when within the max span", () => {
    const bbox = { west: 1, south: 2, east: 5, north: 6 };
    expect(clampBbox(bbox)).toEqual(bbox);
  });

  it("clamps an oversized bbox to a 10x10 window centered on it", () => {
    const clamped = clampBbox({ west: -180, south: -90, east: 180, north: 90 });
    expect(clamped.east - clamped.west).toBeLessThanOrEqual(10);
    expect(clamped.north - clamped.south).toBeLessThanOrEqual(10);
    // centered on (0, 0)
    expect(clamped.west).toBeCloseTo(-5);
    expect(clamped.east).toBeCloseTo(5);
  });

  it("clamps to the poles/antimeridian without exceeding valid coordinate ranges", () => {
    const clamped = clampBbox({ west: 170, south: 80, east: -170, north: 90 });
    expect(clamped.west).toBeGreaterThanOrEqual(-180);
    expect(clamped.east).toBeLessThanOrEqual(180);
    expect(clamped.north).toBeLessThanOrEqual(90);
  });
});

describe("quantizeBbox", () => {
  it("rounds each coordinate to the nearest 0.5 degrees", () => {
    expect(quantizeBbox({ west: 1.24, south: 2.26, east: 5.74, north: 6.76 })).toEqual({
      west: 1,
      south: 2.5,
      east: 5.5,
      north: 7,
    });
  });
});

describe("bboxToPointRadius", () => {
  it("centers on the bbox and covers it within the 250nm cap", () => {
    const { lat, lon, distNm } = bboxToPointRadius({ west: -1, south: -1, east: 1, north: 1 });
    expect(lat).toBeCloseTo(0);
    expect(lon).toBeCloseTo(0);
    expect(distNm).toBeGreaterThan(0);
    expect(distNm).toBeLessThanOrEqual(250);
  });

  it("clamps the radius to 250nm for a large bbox", () => {
    const { distNm } = bboxToPointRadius({ west: -5, south: -5, east: 5, north: 5 });
    expect(distNm).toBe(250);
  });

  it("floors the radius to 5nm for a tiny bbox", () => {
    const { distNm } = bboxToPointRadius({ west: 0, south: 0, east: 0.001, north: 0.001 });
    expect(distNm).toBe(5);
  });
});

describe("capByCount", () => {
  function makeFlight(icao24: string, velocityMs: number | null): Flight {
    return {
      icao24,
      callsign: null,
      aircraftType: null,
      longitude: 0,
      latitude: 0,
      altitudeM: 1000,
      onGround: false,
      velocityMs,
      trueTrack: null,
      verticalRateMs: null,
      lastContact: new Date().toISOString(),
    };
  }

  it("leaves the list untouched when under the cap", () => {
    const flights = [makeFlight("a", 100), makeFlight("b", 200)];
    expect(capByCount(flights)).toEqual({ flights, truncated: false });
  });

  it("caps to 300 and prioritizes faster aircraft when over the limit", () => {
    const flights = Array.from({ length: 305 }, (_, i) => makeFlight(`f${i}`, i));
    const { flights: capped, truncated } = capByCount(flights);

    expect(truncated).toBe(true);
    expect(capped).toHaveLength(300);
    // fastest (velocity 304) should be first after sorting descending
    expect(capped[0].velocityMs).toBe(304);
  });
});
