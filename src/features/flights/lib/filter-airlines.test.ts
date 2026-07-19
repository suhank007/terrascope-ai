import { describe, expect, it } from "vitest";
import { filterFlightsByAirlines } from "./filter-airlines";
import type { Flight } from "../types";

function makeFlight(callsign: string | null): Flight {
  return {
    icao24: `icao-${callsign ?? "none"}`,
    callsign,
    originCountry: "Testland",
    longitude: 0,
    latitude: 0,
    altitudeM: 1000,
    onGround: false,
    velocityMs: 200,
    trueTrack: null,
    verticalRateMs: null,
    lastContact: new Date().toISOString(),
  };
}

describe("filterFlightsByAirlines", () => {
  it("returns all flights unchanged when no airlines are selected", () => {
    const flights = [makeFlight("QTR123"), makeFlight("BAW456")];
    expect(filterFlightsByAirlines(flights, new Set())).toEqual(flights);
  });

  it("keeps only flights whose callsign matches a selected ICAO prefix", () => {
    const flights = [makeFlight("QTR123"), makeFlight("BAW456"), makeFlight("AIC789")];
    const result = filterFlightsByAirlines(flights, new Set(["QTR", "AIC"]));

    expect(result.map((f) => f.callsign)).toEqual(["QTR123", "AIC789"]);
  });

  it("excludes flights with a null or too-short callsign", () => {
    const flights = [makeFlight(null), makeFlight("AB"), makeFlight("QTR123")];
    const result = filterFlightsByAirlines(flights, new Set(["QTR"]));

    expect(result).toHaveLength(1);
    expect(result[0].callsign).toBe("QTR123");
  });

  it("matches case-insensitively against the callsign prefix", () => {
    const flights = [makeFlight("qtr123")];
    const result = filterFlightsByAirlines(flights, new Set(["QTR"]));
    expect(result).toHaveLength(1);
  });
});
