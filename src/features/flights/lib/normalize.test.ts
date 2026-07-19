import { describe, expect, it } from "vitest";
import { normalizeFlights } from "./normalize";

describe("normalizeFlights", () => {
  it("returns an empty array when states is null", () => {
    expect(normalizeFlights({ time: 1700000000, states: null })).toEqual([]);
  });

  it("maps a positional state vector to a Flight, indexing fields by position", () => {
    const state: Parameters<typeof normalizeFlights>[0]["states"] = [
      [
        "abc123",
        "UAL123  ",
        "United States",
        1700000000,
        1700000005,
        2.35,
        48.85,
        5000,
        false,
        220.5,
        90,
        1.2,
        null,
        5200,
        "1200",
        false,
        0,
        3,
      ],
    ];

    const [flight] = normalizeFlights({ time: 1700000000, states: state });

    expect(flight).toMatchObject({
      icao24: "abc123",
      callsign: "UAL123",
      originCountry: "United States",
      longitude: 2.35,
      latitude: 48.85,
      altitudeM: 5000,
      onGround: false,
      velocityMs: 220.5,
      trueTrack: 90,
      verticalRateMs: 1.2,
    });
    expect(flight.lastContact).toBe(new Date(1700000005 * 1000).toISOString());
  });

  it("falls back to geo_altitude when baro_altitude is null", () => {
    const state: Parameters<typeof normalizeFlights>[0]["states"] = [
      ["abc123", null, "France", null, 1700000005, 2.35, 48.85, null, true, 0, null, null, null, 1234, null, false, 0],
    ];

    const [flight] = normalizeFlights({ time: 1700000000, states: state });
    expect(flight.altitudeM).toBe(1234);
    expect(flight.callsign).toBeNull();
  });

  it("drops entries with a null longitude or latitude", () => {
    const state: Parameters<typeof normalizeFlights>[0]["states"] = [
      ["abc123", null, "France", null, 1700000005, null, 48.85, null, true, 0, null, null, null, null, null, false, 0],
    ];

    expect(normalizeFlights({ time: 1700000000, states: state })).toHaveLength(0);
  });
});
