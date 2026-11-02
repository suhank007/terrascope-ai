import { describe, expect, it } from "vitest";
import { parseFlightQuery } from "./query";

describe("parseFlightQuery", () => {
  it("reads IATA flight numbers, with or without a space and in any case", () => {
    expect(parseFlightQuery("BA117")).toEqual({ kind: "flight-number", airline: "BA", number: "117", text: "BA117" });
    expect(parseFlightQuery("ba 117")).toMatchObject({ kind: "flight-number", airline: "BA", number: "117" });
    expect(parseFlightQuery("EK1")).toMatchObject({ airline: "EK", number: "1" });
  });

  it("handles airline codes that contain a digit", () => {
    expect(parseFlightQuery("6E203")).toMatchObject({ kind: "flight-number", airline: "6E", number: "203" });
    expect(parseFlightQuery("U21234")).toMatchObject({ kind: "flight-number", airline: "U2", number: "1234" });
  });

  it("drops leading zeros from the number", () => {
    expect(parseFlightQuery("BA0117")).toMatchObject({ number: "117" });
  });

  it("reads ICAO callsigns", () => {
    expect(parseFlightQuery("BAW117")).toEqual({ kind: "callsign", callsign: "BAW117", text: "BAW117" });
    expect(parseFlightQuery("uae1")).toMatchObject({ kind: "callsign", callsign: "UAE1" });
    expect(parseFlightQuery("EZY64VV")).toMatchObject({ kind: "callsign", callsign: "EZY64VV" });
  });

  it("reads registrations before it tries flight numbers", () => {
    expect(parseFlightQuery("G-BODO")).toMatchObject({ kind: "registration", registration: "G-BODO" });
    expect(parseFlightQuery("vt-anb")).toMatchObject({ kind: "registration", registration: "VT-ANB" });
    expect(parseFlightQuery("9V-SMA")).toMatchObject({ kind: "registration", registration: "9V-SMA" });
    expect(parseFlightQuery("N12345")).toMatchObject({ kind: "registration", registration: "N12345" });
    expect(parseFlightQuery("N117AB")).toMatchObject({ kind: "registration" });
  });

  it("rejects things that aren't flights", () => {
    expect(parseFlightQuery("")).toBeNull();
    expect(parseFlightQuery("12345")).toBeNull();
    expect(parseFlightQuery("hello world")).toBeNull();
    expect(parseFlightQuery("BA")).toBeNull();
    expect(parseFlightQuery("A".repeat(20))).toBeNull();
  });
});
