import { describe, expect, it } from "vitest";
import { parseDurationMinutes, parseFaaStatus } from "./faa";
import { classifyPhase, summarizeTraffic } from "./traffic";
import { computeOutlook } from "./outlook";
import type { Flight } from "@/features/flights/types";
import type { FaaStatus, Metar } from "../types";

const XML = `<AIRPORT_STATUS_INFORMATION><Update_Time>Mon Nov 2 14:21:05 2026 GMT</Update_Time>
<Delay_type><Name>Ground Stop Programs</Name><Ground_Stop_List>
<Program><ARPT>MIA</ARPT><Reason>thunderstorms</Reason><End_Time>10:00 am EST</End_Time></Program>
<Program><ARPT>FLL</ARPT><Reason>thunderstorms</Reason><End_Time>11:00 am EST</End_Time></Program>
</Ground_Stop_List></Delay_type>
<Delay_type><Name>Ground Delay Programs</Name><Ground_Delay_List>
<Ground_Delay><ARPT>SAN</ARPT><Reason>airport volume</Reason><Avg>29 minutes</Avg><Max>1 hour and 19 minutes</Max></Ground_Delay>
</Ground_Delay_List></Delay_type>
<Delay_type><Name>General Arrival/Departure Delay Info</Name><Arrival_Departure_Delay_List>
<Delay><ARPT>RSW</ARPT><Reason>WX:Thunderstorms</Reason><Arrival_Departure Type="Departure"><Min>1 hour and 31 minutes</Min><Max>1 hour and 45 minutes</Max><Trend>Increasing</Trend></Arrival_Departure></Delay>
<Delay><ARPT>MIA</ARPT><Reason>TM Initiatives:MIT:WX</Reason><Arrival_Departure Type="Departure"><Min>31 minutes</Min><Max>45 minutes</Max><Trend>Increasing</Trend></Arrival_Departure><Arrival_Departure Type="Arrival"><Min>15 minutes</Min><Max>29 minutes</Max><Trend>Decreasing</Trend></Arrival_Departure></Delay>
</Arrival_Departure_Delay_List></Delay_type>
<Delay_type><Name>Airport Closures</Name><Airport_Closure_List>
<Airport><ARPT>LAX</ARPT><Reason>!LAX 05/277 AP CLSD TO NON SKED TRANSIENT GA ACFT</Reason><Start>May 27 at 18:26 UTC.</Start><Reopen>May 28 at 16:00 UTC.</Reopen></Airport>
</Airport_Closure_List></Delay_type></AIRPORT_STATUS_INFORMATION>`;

describe("parseDurationMinutes", () => {
  it("handles hours, minutes and both", () => {
    expect(parseDurationMinutes("1 hour and 19 minutes")).toBe(79);
    expect(parseDurationMinutes("29 minutes")).toBe(29);
    expect(parseDurationMinutes("2 hours")).toBe(120);
    expect(parseDurationMinutes("soon")).toBeNull();
    expect(parseDurationMinutes(null)).toBeNull();
  });
});

describe("parseFaaStatus", () => {
  it("finds an airport's ground stop and only that airport's", () => {
    expect(parseFaaStatus(XML, "MIA").groundStop).toEqual({ reason: "thunderstorms", endTime: "10:00 am EST" });
    expect(parseFaaStatus(XML, "FLL").groundStop?.endTime).toBe("11:00 am EST");
    expect(parseFaaStatus(XML, "JFK").groundStop).toBeNull();
  });

  it("parses ground delay programmes into minutes", () => {
    expect(parseFaaStatus(XML, "SAN").groundDelay).toEqual({ reason: "airport volume", avgMinutes: 29, maxMinutes: 79 });
  });

  it("parses departure and arrival delays, including both for one airport", () => {
    expect(parseFaaStatus(XML, "RSW").delays).toEqual([{ kind: "Departure", minMinutes: 91, maxMinutes: 105, trend: "Increasing", reason: "WX:Thunderstorms" }]);
    const mia = parseFaaStatus(XML, "MIA");
    expect(mia.delays.map((d) => d.kind)).toEqual(["Departure", "Arrival"]);
  });

  it("passes closures through as notices without scoring them", () => {
    const lax = parseFaaStatus(XML, "LAX");
    expect(lax.notices).toHaveLength(1);
    expect(lax.notices[0].text).toContain("NON SKED");
    expect(lax.groundStop).toBeNull();
  });

  it("returns an empty status for an airport with nothing going on", () => {
    const s = parseFaaStatus(XML, "ORD");
    expect(s).toMatchObject({ groundStop: null, groundDelay: null, delays: [], notices: [] });
    expect(s.updatedAt).toBe("Mon Nov 2 14:21:05 2026 GMT");
  });
});

function flight(over: Partial<Flight>): Flight {
  return { icao24: "abc", callsign: "TST1", aircraftType: "A320", registration: null, longitude: 0, latitude: 0, altitudeM: 3000, onGround: false, velocityMs: 100, trueTrack: 0, verticalRateMs: 0, lastContact: "", ...over };
}
const FPM = 0.00508;

describe("classifyPhase", () => {
  it("separates arrivals, departures, ground and the rest", () => {
    expect(classifyPhase(flight({ onGround: true }))).toBe("ground");
    expect(classifyPhase(flight({ altitudeM: 1500, verticalRateMs: -800 * FPM }))).toBe("arriving");
    expect(classifyPhase(flight({ altitudeM: 1500, verticalRateMs: 1500 * FPM }))).toBe("departing");
    expect(classifyPhase(flight({ altitudeM: 1500, verticalRateMs: 50 * FPM }))).toBe("other");
  });

  it("calls anything high up an overflight even if it is descending", () => {
    expect(classifyPhase(flight({ altitudeM: 11000, verticalRateMs: -2000 * FPM }))).toBe("other");
  });

  it("is 'other' when altitude or rate is unknown", () => {
    expect(classifyPhase(flight({ verticalRateMs: null }))).toBe("other");
  });
});

describe("summarizeTraffic", () => {
  const flights = [
    flight({ callsign: "ARR1", altitudeM: 2000, verticalRateMs: -900 * FPM }),
    flight({ callsign: "ARR2", altitudeM: 800, verticalRateMs: -700 * FPM }),
    flight({ callsign: "DEP1", altitudeM: 1200, verticalRateMs: 2000 * FPM }),
    flight({ callsign: "GND1", onGround: true, altitudeM: 0 }),
    flight({ callsign: "HIGH1", altitudeM: 11000 }),
    flight({ callsign: null, altitudeM: 500, verticalRateMs: -900 * FPM }),
  ];
  const t = summarizeTraffic(flights, 25);

  it("counts every phase, including aircraft without a callsign", () => {
    expect(t).toMatchObject({ total: 6, onGround: 1, arriving: 3, departing: 1, other: 1, radiusNm: 25, capped: false });
  });

  it("lists only named arrivals and departures, lowest first", () => {
    expect(t.samples.map((s) => s.callsign)).toEqual(["ARR2", "DEP1", "ARR1"]);
    expect(t.samples[0]).toMatchObject({ phase: "arriving", altitudeFt: 2625 });
  });

  it("never reports a negative altitude", () => {
    const t = summarizeTraffic([flight({ callsign: "LOW1", altitudeM: -60, verticalRateMs: 1500 * FPM })], 25);
    expect(t.samples[0].altitudeFt).toBe(0);
  });

  it("flags a capped result", () => {
    expect(summarizeTraffic(Array.from({ length: 250 }, () => flight({})), 25).capped).toBe(true);
  });
});

const metar = (over: Partial<Metar> = {}): Metar => ({
  icao: "KJFK", observedAt: "", flightCategory: "VFR", tempC: 10, windDir: 180, windKt: 8, gustKt: null, visibilitySm: 10, ceilingFt: null, weather: [], raw: "", ...over,
});
const faa = (over: Partial<FaaStatus> = {}): FaaStatus => ({ groundStop: null, groundDelay: null, delays: [], notices: [], updatedAt: null, ...over });

describe("computeOutlook", () => {
  it("is calm when nothing is wrong, and says what it is based on", () => {
    const o = computeOutlook({ metar: metar(), taf: null, faa: faa(), faaState: "covered" });
    expect(o).toMatchObject({ level: "none", headline: "Running normally", basis: "faa-and-weather" });
    expect(computeOutlook({ metar: metar(), taf: null, faa: null, faaState: "not-covered" })).toMatchObject({ headline: "No weather problems", basis: "weather-only" });
  });

  it("goes high on an FAA ground stop", () => {
    const o = computeOutlook({ metar: metar(), taf: null, faa: faa({ groundStop: { reason: "thunderstorms", endTime: "10:00 am EST" } }), faaState: "covered" });
    expect(o.level).toBe("high");
    expect(o.reasons[0].source).toBe("FAA");
  });

  it("scales ground delay programmes: 29 min is caution, 75 min is high", () => {
    expect(computeOutlook({ metar: null, taf: null, faa: faa({ groundDelay: { reason: null, avgMinutes: 29, maxMinutes: 79 } }), faaState: "covered" }).level).toBe("caution");
    expect(computeOutlook({ metar: null, taf: null, faa: faa({ groundDelay: { reason: null, avgMinutes: 75, maxMinutes: 120 } }), faaState: "covered" }).level).toBe("high");
  });

  it("ignores trivial delays and scores real ones", () => {
    const minor = faa({ delays: [{ kind: "Departure", minMinutes: 5, maxMinutes: 14, trend: null, reason: null }] });
    expect(computeOutlook({ metar: metar(), taf: null, faa: minor, faaState: "covered" }).level).toBe("none");
    const bad = faa({ delays: [{ kind: "Departure", minMinutes: 91, maxMinutes: 105, trend: "Increasing", reason: "WX:Thunderstorms" }] });
    expect(computeOutlook({ metar: metar(), taf: null, faa: bad, faaState: "covered" }).level).toBe("high");
  });

  it("never scores closure notices", () => {
    const o = computeOutlook({ metar: metar(), taf: null, faa: faa({ notices: [{ text: "AP CLSD TO NON SKED GA", start: null, reopen: null }] }), faaState: "covered" });
    expect(o.level).toBe("none");
  });

  it("scores weather: LIFR high, IFR caution, thunderstorms caution, strong wind", () => {
    expect(computeOutlook({ metar: metar({ flightCategory: "LIFR" }), taf: null, faa: null, faaState: "not-covered" }).level).toBe("high");
    expect(computeOutlook({ metar: metar({ flightCategory: "IFR" }), taf: null, faa: null, faaState: "not-covered" }).level).toBe("caution");
    expect(computeOutlook({ metar: metar({ weather: ["thunderstorm with rain"] }), taf: null, faa: null, faaState: "not-covered" }).level).toBe("caution");
    expect(computeOutlook({ metar: metar({ gustKt: 32 }), taf: null, faa: null, faaState: "not-covered" }).level).toBe("caution");
    expect(computeOutlook({ metar: metar({ gustKt: 45 }), taf: null, faa: null, faaState: "not-covered" }).level).toBe("high");
  });

  it("uses the TAF for a forecast problem without double-counting a storm already reported", () => {
    const taf = { hours: 12, worstCategory: "IFR" as const, worstIsTemporary: true, thunderstorm: true, maxGustKt: null, weather: [], raw: "", issuedAt: "" };
    const o = computeOutlook({ metar: metar({ weather: ["thunderstorm"] }), taf, faa: null, faaState: "not-covered" });
    expect(o.reasons.filter((r) => r.text.includes("hunderstorm")).length).toBe(1);
    expect(o.reasons.some((r) => r.text.includes("at times"))).toBe(true);
  });

  it("never reads as normal when the FAA feed is down for a US airport", () => {
    const o = computeOutlook({ metar: metar(), taf: null, faa: null, faaState: "outage" });
    expect(o.level).toBe("none");
    expect(o.headline).toBe("Couldn't confirm FAA status");
    expect(o.basis).toBe("weather-only");
    expect(o.unchecked).toContain("FAA delay status");
  });

  it("says it couldn't check, rather than 'normal', when there is no weather", () => {
    const o = computeOutlook({ metar: null, taf: null, faa: null, faaState: "not-covered" });
    expect(o.headline).toBe("Couldn't check conditions");
    expect(o.unchecked).toEqual(["Current weather", "Weather forecast"]);
  });
});
