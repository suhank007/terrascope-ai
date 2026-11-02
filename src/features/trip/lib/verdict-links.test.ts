import { describe, expect, it } from "vitest";
import { computeVerdict, maxSeverity } from "./verdict";
import { buildTripLinks } from "./links";
import { orderLinkGroups } from "./link-order";
import type { Destination, Section } from "../types";

const NOW = Date.parse("2026-11-01T12:00:00Z");
const unavailable = { status: "unavailable", reason: "test" } as const;

function base() {
  return { advisories: unavailable, health: unavailable, hazards: unavailable, airQuality: unavailable, forecast: unavailable, now: NOW } as Parameters<typeof computeVerdict>[0];
}
const ok = <T,>(data: T): Section<T> => ({ status: "ok", data });

describe("maxSeverity", () => {
  it("picks the worst level", () => {
    expect(maxSeverity([])).toBe("none");
    expect(maxSeverity(["caution", "critical", "high"])).toBe("critical");
  });
});

describe("computeVerdict", () => {
  it("is quiet when every source is unavailable, invents no reasons, and says it couldn't check", () => {
    const v = computeVerdict(base());
    expect(v.level).toBe("none");
    expect(v.reasons).toEqual([]);
    expect(v.headline).toBe("Couldn't confirm official advice");
    expect(v.unchecked).toEqual(["Government advisories", "Health notices", "Live hazards", "Air quality", "Forecast"]);
  });

  it("only says 'no major flags' when the official sources were actually read", () => {
    const v = computeVerdict({
      ...base(),
      advisories: ok({ uk: null, us: null }),
      health: ok({ notices: [], outbreaks: [] }),
    });
    expect(v.headline).toBe("No major flags right now");
    expect(v.unchecked).toEqual(["Live hazards", "Air quality", "Forecast"]);
  });

  it("goes critical on an official do-not-travel and cites the source", () => {
    const v = computeVerdict({
      ...base(),
      advisories: ok({
        uk: { severity: "critical", alerts: ["avoid_all_travel_to_whole_country"], partial: false, summary: "", url: "https://gov.uk/x", updatedAt: null },
        us: { level: 4, severity: "critical", label: "Do Not Travel", url: "https://state/x", updatedAt: null },
      }),
    });
    expect(v.level).toBe("critical");
    expect(v.headline).toBe("Official advice: do not travel");
    expect(v.reasons.map((r) => r.source)).toEqual(["UK FCDO", "US State Dept"]);
    expect(v.reasons[0].url).toBe("https://gov.uk/x");
  });

  it("treats a partial FCDO warning as caution only", () => {
    const v = computeVerdict({
      ...base(),
      advisories: ok({ uk: { severity: "caution", alerts: ["avoid_all_travel_to_parts"], partial: true, summary: "", url: "u", updatedAt: null }, us: null }),
    });
    expect(v.level).toBe("caution");
    expect(v.reasons[0].text).toContain("parts of the country");
  });

  it("does not let weather or a moderate quake reach high", () => {
    const v = computeVerdict({
      ...base(),
      hazards: ok({
        quakes: [{ id: "q", magnitude: 6.2, place: "x", distanceKm: 120, time: "2026-11-01T09:00:00Z", tsunami: false }],
        fireCount: 0,
        nearestFireKm: null,
        firesChecked: true,
        quakeRadiusKm: 300,
        fireRadiusKm: 100,
      }),
      forecast: ok({ timezone: "UTC", days: [{ date: "2026-11-02", weatherCode: 96, maxC: 41, minC: 20, rainChancePct: 90, windMaxKph: 80 }] }),
    });
    expect(v.level).toBe("caution");
    expect(v.reasons.length).toBe(4);
  });

  it("raises high for a M7+ quake or hazardous air", () => {
    const quake = computeVerdict({
      ...base(),
      hazards: ok({ quakes: [{ id: "q", magnitude: 7.1, place: "x", distanceKm: 50, time: "2026-11-01T09:00:00Z", tsunami: true }], fireCount: 0, nearestFireKm: null, firesChecked: true, quakeRadiusKm: 300, fireRadiusKm: 100 }),
    });
    expect(quake.level).toBe("high");
    expect(computeVerdict({ ...base(), airQuality: ok({ usAqi: 230, label: "Very unhealthy", color: "#fff", observedAt: "" }) }).level).toBe("high");
  });

  it("ignores quakes older than a day and fires that are far and few", () => {
    const v = computeVerdict({
      ...base(),
      hazards: ok({
        quakes: [{ id: "old", magnitude: 6.8, place: "x", distanceKm: 50, time: "2026-10-29T09:00:00Z", tsunami: false }],
        fireCount: 3,
        nearestFireKm: 80,
        firesChecked: true,
        quakeRadiusKm: 300,
        fireRadiusKm: 100,
      }),
    });
    expect(v.level).toBe("none");
  });

  it("sorts reasons worst first", () => {
    const v = computeVerdict({
      ...base(),
      forecast: ok({ timezone: "UTC", days: [{ date: "d", weatherCode: 99, maxC: 20, minC: 10, rainChancePct: null, windMaxKph: null }] }),
      health: ok({ notices: [{ level: 3, severity: "high", title: "Measles in X", summary: "", url: "u", date: null }], outbreaks: [] }),
    });
    expect(v.reasons.map((r) => r.severity)).toEqual(["high", "caution"]);
  });
});

const PARIS: Destination = { name: "Paris", countryCode: "FR", countryName: "France", latitude: 48.8566, longitude: 2.3522 };

describe("buildTripLinks", () => {
  it("adds validated dates to stay links and leaves them out when missing or malformed", () => {
    const withDates = buildTripLinks(PARIS, { from: "2026-12-01", to: "2026-12-05" });
    expect(withDates.find((l) => l.id === "booking")!.url).toContain("checkin=2026-12-01&checkout=2026-12-05");
    const bad = buildTripLinks(PARIS, { from: "tomorrow", to: "2026-12-05" });
    expect(bad.find((l) => l.id === "booking")!.url).not.toContain("checkin");
  });

  it("leaves dates out when the end is before the start", () => {
    const links = buildTripLinks(PARIS, { from: "2026-12-09", to: "2026-12-01" });
    expect(links.find((l) => l.id === "booking")!.url).not.toContain("checkin");
    expect(links.find((l) => l.id === "airbnb")!.url).not.toContain("checkin");
  });

  it("encodes the place so odd names can't break out of the URL", () => {
    const weird = buildTripLinks({ ...PARIS, name: "Saint-Denis & <script>", countryName: "France" });
    for (const link of weird) expect(link.url).not.toMatch(/[<> ]/);
    expect(weird.find((l) => l.id === "booking")!.url).toContain("%26");
  });

  it("builds country eSIM slugs without accents or spaces", () => {
    const links = buildTripLinks({ ...PARIS, countryCode: "CI", countryName: "Ivory Coast" });
    expect(links.find((l) => l.id === "airalo")!.url).toMatch(/^https:\/\/www\.airalo\.com\/[a-z0-9-]+-esim$/);
  });

  it("reorders groups for business without losing any link", () => {
    const links = buildTripLinks(PARIS);
    const business = orderLinkGroups(links, "business");
    const leisure = orderLinkGroups(links, "leisure");
    expect(business[0].group).toBe("fly");
    expect(leisure[0].group).toBe("stay");
    expect(business.flatMap((g) => g.links)).toHaveLength(links.length);
    expect(leisure.flatMap((g) => g.links)).toHaveLength(links.length);
  });
});
