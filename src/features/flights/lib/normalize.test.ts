import { describe, expect, it } from "vitest";
import { normalizeFlights } from "./normalize";

describe("normalizeFlights", () => {
  it("returns an empty array when ac is null", () => {
    expect(normalizeFlights({ now: 1700000000000, ac: null })).toEqual([]);
  });

  it("maps an aircraft record to a Flight, converting aviation units to SI", () => {
    const [flight] = normalizeFlights({
      now: 1700000005000,
      ac: [
        {
          hex: "abc123",
          flight: "UAL123  ",
          desc: "BOEING 737-800",
          r: "N123AB",
          lat: 48.85,
          lon: 2.35,
          alt_baro: 16404, // ~5000m
          gs: 428.7, // ~220.5 m/s
          track: 90,
          baro_rate: 236, // ~1.2 m/s
          seen: 5,
        },
      ],
    });

    expect(flight.icao24).toBe("abc123");
    expect(flight.callsign).toBe("UAL123");
    expect(flight.aircraftType).toBe("BOEING 737-800");
    expect(flight.registration).toBe("N123AB");
    expect(flight.longitude).toBe(2.35);
    expect(flight.latitude).toBe(48.85);
    expect(flight.onGround).toBe(false);
    expect(flight.altitudeM).toBeCloseTo(5000, 0);
    expect(flight.velocityMs).toBeCloseTo(220.5, 0);
    expect(flight.trueTrack).toBe(90);
    expect(flight.verticalRateMs).toBeCloseTo(1.2, 1);
    expect(flight.lastContact).toBe(new Date(1700000000000).toISOString());
  });

  it("treats alt_baro of 'ground' as on-ground with zero altitude", () => {
    const [flight] = normalizeFlights({
      now: 1700000000000,
      ac: [{ hex: "abc123", lat: 48.85, lon: 2.35, alt_baro: "ground" }],
    });

    expect(flight.onGround).toBe(true);
    expect(flight.altitudeM).toBe(0);
    expect(flight.callsign).toBeNull();
  });

  it("falls back to alt_geom when alt_baro is missing", () => {
    const [flight] = normalizeFlights({
      now: 1700000000000,
      ac: [{ hex: "abc123", lat: 48.85, lon: 2.35, alt_geom: 3048 }],
    });

    expect(flight.altitudeM).toBeCloseTo(929, 0);
  });

  it("drops entries with a missing latitude or longitude", () => {
    const result = normalizeFlights({
      now: 1700000000000,
      ac: [{ hex: "abc123", lat: 48.85 }],
    });

    expect(result).toHaveLength(0);
  });
});
