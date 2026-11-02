import { describe, expect, it } from "vitest";
import { computeProgress } from "./progress";

const LHR = { latitude: 51.47, longitude: -0.4543 };
const JFK = { latitude: 40.6398, longitude: -73.7789 };

describe("computeProgress", () => {
  it("is about halfway over the Atlantic, with a sensible ETA", () => {
    const mid = { latitude: 53, longitude: -37, speedKt: 480, onGround: false };
    const p = computeProgress(LHR, JFK, mid);
    expect(p.totalKm).toBeGreaterThan(5400);
    expect(p.totalKm).toBeLessThan(5700);
    expect(p.percent).toBeGreaterThan(40);
    expect(p.percent).toBeLessThan(60);
    expect(p.offRoute).toBe(false);
    // ~2,800 km at 480 kt (889 km/h) is a little over three hours.
    expect(p.etaMinutes).toBeGreaterThan(170);
    expect(p.etaMinutes).toBeLessThan(220);
  });

  it("is 0% at the origin and near 100% at the destination", () => {
    expect(computeProgress(LHR, JFK, { ...LHR, speedKt: 150, onGround: false }).percent).toBe(0);
    expect(computeProgress(LHR, JFK, { ...JFK, speedKt: 150, onGround: false }).percent).toBe(100);
  });

  it("gives no ETA on the ground or when slow", () => {
    expect(computeProgress(LHR, JFK, { ...LHR, speedKt: 0, onGround: true }).etaMinutes).toBeNull();
    expect(computeProgress(LHR, JFK, { latitude: 52, longitude: -10, speedKt: 80, onGround: false }).etaMinutes).toBeNull();
    expect(computeProgress(LHR, JFK, { latitude: 52, longitude: -10, speedKt: null, onGround: false }).etaMinutes).toBeNull();
  });

  it("flags an aircraft that is nowhere near the stated route", () => {
    // Over Australia on a London to New York route: the route is wrong.
    const p = computeProgress(LHR, JFK, { latitude: -25, longitude: 135, speedKt: 450, onGround: false });
    expect(p.offRoute).toBe(true);
    expect(p.percent).toBeNull();
    expect(p.etaMinutes).toBeNull();
  });

  it("doesn't claim a percentage for a very short hop", () => {
    const a = { latitude: 51.5, longitude: -0.1 };
    const b = { latitude: 51.52, longitude: -0.12 };
    expect(computeProgress(a, b, { ...a, speedKt: 200, onGround: false }).percent).toBeNull();
  });
});
