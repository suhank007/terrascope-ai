import { describe, expect, it } from "vitest";
import { getAirlineName } from "./airlines";

describe("getAirlineName", () => {
  it("resolves a known ICAO prefix to its airline name", () => {
    expect(getAirlineName("DAL123")).toBe("Delta Air Lines");
  });

  it("matches case-insensitively", () => {
    expect(getAirlineName("dal123")).toBe("Delta Air Lines");
  });

  it("returns null for an unrecognized prefix (e.g. private/charter flights)", () => {
    expect(getAirlineName("JRE809")).toBeNull();
  });

  it("returns null for a null or too-short callsign", () => {
    expect(getAirlineName(null)).toBeNull();
    expect(getAirlineName("AB")).toBeNull();
  });
});
