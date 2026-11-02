import { describe, expect, it } from "vitest";
import { getAirport, nearestAirports, searchAirports } from "./dataset";

describe("getAirport", () => {
  it("finds by IATA or ICAO, case-insensitively", () => {
    expect(getAirport("lhr")?.name).toContain("Heathrow");
    expect(getAirport("EGLL")?.iata).toBe("LHR");
    expect(getAirport("ZZZ")).toBeNull();
  });

  it("cleans the parenthetical off municipality names", () => {
    expect(getAirport("CDG")?.city).toBe("Paris");
  });

  it("carries coordinates and a size", () => {
    const jfk = getAirport("JFK")!;
    expect(jfk.latitude).toBeCloseTo(40.64, 1);
    expect(jfk.size).toBe("large");
    expect(jfk.countryCode).toBe("US");
  });
});

describe("searchAirports", () => {
  it("puts an exact code first", () => {
    expect(searchAirports("DXB")[0].iata).toBe("DXB");
    expect(searchAirports("omdb")[0].iata).toBe("DXB");
  });

  it("finds by city, ignoring case and accents", () => {
    const results = searchAirports("são paulo");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((a) => a.iata === "GRU")).toBe(true);
  });

  it("returns several airports for a multi-airport city, biggest first", () => {
    const codes = searchAirports("london").map((a) => a.iata);
    expect(codes).toContain("LHR");
    expect(codes.indexOf("LHR")).toBeLessThan(codes.indexOf("LCY") === -1 ? 99 : codes.indexOf("LCY") + 1);
  });

  it("returns nothing for tiny or unmatched queries", () => {
    expect(searchAirports("x")).toEqual([]);
    expect(searchAirports("qqqqzzzz")).toEqual([]);
  });

  it("respects the limit", () => {
    expect(searchAirports("international", 5)).toHaveLength(5);
  });
});

describe("nearestAirports", () => {
  it("returns the closest first, with distances", () => {
    const near = nearestAirports(51.5072, -0.1276, 3);
    expect(near).toHaveLength(3);
    expect(near[0].distanceKm).toBeLessThanOrEqual(near[1].distanceKm);
    expect(near.map((a) => a.iata)).toContain("LCY");
  });

  it("returns nothing in the middle of the ocean", () => {
    expect(nearestAirports(-45, -120, 3, 200)).toEqual([]);
  });
});
