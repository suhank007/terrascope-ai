import { describe, expect, it } from "vitest";
import { compassPoint, formatAltitude, verticalTrend } from "./format";

describe("compassPoint", () => {
  it("maps headings to the nearest of 16 points", () => {
    expect(compassPoint(0)).toBe("N");
    expect(compassPoint(192)).toBe("SSW");
    expect(compassPoint(90)).toBe("E");
    expect(compassPoint(359)).toBe("N");
    expect(compassPoint(-90)).toBe("W");
    expect(compassPoint(360)).toBe("N");
  });
});

describe("verticalTrend", () => {
  it("ignores small noise and names a clear rate", () => {
    expect(verticalTrend(1408)).toBe("Climbing");
    expect(verticalTrend(-900)).toBe("Descending");
    expect(verticalTrend(120)).toBe("Level");
    expect(verticalTrend(-299)).toBe("Level");
    expect(verticalTrend(null)).toBeNull();
  });
});

describe("formatAltitude", () => {
  it("uses flight levels at and above 18,000 ft", () => {
    expect(formatAltitude(32350, false)).toBe("FL324");
    expect(formatAltitude(37000, false)).toBe("FL370");
    expect(formatAltitude(18000, false)).toBe("FL180");
  });

  it("uses feet below that, and handles ground and unknown", () => {
    expect(formatAltitude(4500, false)).toBe("4,500 ft");
    expect(formatAltitude(0, true)).toBe("On the ground");
    expect(formatAltitude(null, false)).toBe("—");
  });
});
