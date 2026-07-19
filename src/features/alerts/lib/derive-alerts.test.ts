import { describe, expect, it } from "vitest";
import { deriveAlerts } from "./derive-alerts";
import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";

function quake(magnitude: number, time = "2026-07-19T10:00:00.000Z"): Earthquake {
  return {
    id: `eq-${magnitude}`,
    magnitude,
    place: "Test Place",
    time,
    longitude: 0,
    latitude: 0,
    depthKm: 10,
    url: "https://example.com",
    tsunami: false,
  };
}

function fire(frp: number, confidence: WildfireHotspot["confidence"], time = "2026-07-19T10:00:00.000Z"): WildfireHotspot {
  return {
    id: `fire-${frp}`,
    latitude: 0,
    longitude: 0,
    brightnessK: 300,
    frp,
    confidence,
    acquiredAt: time,
    satellite: "N",
  };
}

describe("deriveAlerts", () => {
  it("excludes earthquakes below the watch magnitude threshold", () => {
    const alerts = deriveAlerts([quake(5.4), quake(3.0)], []);
    expect(alerts).toHaveLength(0);
  });

  it("classifies earthquake severity by magnitude", () => {
    const alerts = deriveAlerts([quake(5.5), quake(7.2)], []);
    const bySeverity = Object.fromEntries(alerts.map((a) => [a.id, a.severity]));
    expect(bySeverity["alert-eq-eq-5.5"]).toBe("watch");
    expect(bySeverity["alert-eq-eq-7.2"]).toBe("warning");
  });

  it("only includes high-confidence wildfires above the FRP threshold", () => {
    const alerts = deriveAlerts([], [fire(30, "high"), fire(60, "nominal"), fire(60, "high")]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].kind).toBe("wildfire");
  });

  it("sorts combined alerts newest first", () => {
    const older = quake(6.0, "2026-07-19T08:00:00.000Z");
    const newer = fire(210, "high", "2026-07-19T09:00:00.000Z");
    const alerts = deriveAlerts([older], [newer]);

    expect(alerts.map((a) => a.kind)).toEqual(["wildfire", "earthquake"]);
  });

  it("caps the result at 20 alerts", () => {
    const quakes = Array.from({ length: 30 }, (_, i) => quake(6 + i * 0.01));
    const alerts = deriveAlerts(quakes, []);
    expect(alerts).toHaveLength(20);
  });
});
