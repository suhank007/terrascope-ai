import { describe, expect, it } from "vitest";
import { haversineKm } from "./geo";
import { computeHazards } from "./hazards";
import { classifySight, parseSights, sightsQuery } from "./sights";
import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";

const PARIS = { latitude: 48.8566, longitude: 2.3522 };

describe("haversineKm", () => {
  it("is ~344 km from Paris to London and 0 to itself", () => {
    expect(haversineKm(48.8566, 2.3522, 51.5072, -0.1276)).toBeGreaterThan(340);
    expect(haversineKm(48.8566, 2.3522, 51.5072, -0.1276)).toBeLessThan(348);
    expect(haversineKm(10, 10, 10, 10)).toBe(0);
  });
});

function quake(id: string, magnitude: number, latitude: number, longitude: number): Earthquake {
  return { id, magnitude, place: id, time: "2026-11-01T00:00:00Z", longitude, latitude, depthKm: 10, url: "", tsunami: false };
}
function fire(id: string, latitude: number, longitude: number): WildfireHotspot {
  return { id, latitude, longitude, brightnessK: 350, frp: 10, confidence: "high", acquiredAt: "2026-11-01T00:00:00Z", satellite: "N" };
}

describe("computeHazards", () => {
  it("keeps only quakes within 300 km, strongest first", () => {
    const result = computeHazards(PARIS, [quake("near-small", 3, 48.9, 2.4), quake("near-big", 5.2, 49.5, 3), quake("tokyo", 6.5, 35.6, 139.7)], []);
    expect(result.quakes.map((q) => q.id)).toEqual(["near-big", "near-small"]);
  });

  it("counts fires within 100 km and reports the nearest", () => {
    const result = computeHazards(PARIS, [], [fire("a", 48.9, 2.4), fire("b", 49.3, 2.4), fire("far", 40, 10)]);
    expect(result.fireCount).toBe(2);
    expect(result.nearestFireKm).toBeLessThan(10);
    expect(result.firesChecked).toBe(true);
  });

  it("does not claim zero fires when the wildfire feed isn't available", () => {
    const result = computeHazards(PARIS, [], null);
    expect(result.firesChecked).toBe(false);
    expect(result.fireCount).toBe(0);
    expect(result.nearestFireKm).toBeNull();
  });
});

describe("classifySight", () => {
  it("sorts descriptions into categories", () => {
    expect(classifySight("art museum in Paris, France")).toBe("culture");
    expect(classifySight("tower located on the Champ de Mars in Paris")).toBe("landmark");
    expect(classifySight("public park in Kyoto")).toBe("outdoors");
    expect(classifySight("observation deck on the 56th floor")).toBe("viewpoint");
  });

  it("rejects things that are not sights", () => {
    expect(classifySight("capital and most populous city in France")).toBeNull();
    expect(classifySight("Romance language")).toBeNull();
    expect(classifySight("2015 international treaty regarding climate change")).toBeNull();
    expect(classifySight("French commune in Hauts-de-Seine")).toBeNull();
  });
});

function row(id: string, label: string, description: string, sitelinks: number, lon = 2.3, lat = 48.85) {
  return {
    item: { value: `http://www.wikidata.org/entity/${id}` },
    itemLabel: { value: label },
    itemDescription: { value: description },
    sitelinks: { value: String(sitelinks) },
    coord: { value: `Point(${lon} ${lat})` },
  };
}

describe("parseSights", () => {
  const payload = {
    results: {
      bindings: [
        row("Q90", "Paris", "capital and most populous city in France", 366),
        row("Q243", "Eiffel Tower", "tower located on the Champ de Mars in Paris", 191),
        row("Q19675", "Louvre Museum", "art and archeology museum in Paris, France", 170),
        row("Q243", "Eiffel Tower", "tower located on the Champ de Mars in Paris", 191),
        row("Q999", "Q999", "museum with no english label", 90),
        row("Q500", "Hidden Park", "public park", 60),
        { item: { value: "http://www.wikidata.org/entity/Q1" }, itemLabel: { value: "No coords" }, itemDescription: { value: "museum" }, sitelinks: { value: "50" } },
      ],
    },
  };

  it("drops non-places, unlabelled items, duplicates and rows without coordinates", () => {
    const names = parseSights(payload, PARIS).map((s) => s.name);
    expect(names).toEqual(["Eiffel Tower", "Louvre Museum", "Hidden Park"]);
  });

  it("ranks by language coverage and fills links and distance", () => {
    const [top] = parseSights(payload, PARIS);
    expect(top).toMatchObject({ id: "Q243", category: "landmark", languages: 191 });
    expect(top.url).toBe("https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/Q243");
    expect(top.distanceKm).toBeGreaterThanOrEqual(0);
    expect(top.mapUrl).toContain("openstreetmap.org");
  });

  it("respects the limit and tolerates an empty payload", () => {
    expect(parseSights(payload, PARIS, 1)).toHaveLength(1);
    expect(parseSights({}, PARIS)).toEqual([]);
  });
});

describe("sightsQuery", () => {
  it("puts longitude before latitude, as WKT requires", () => {
    expect(sightsQuery(48.8566, 2.3522, 10, 40)).toContain('Point(2.3522 48.8566)');
    expect(sightsQuery(48.8566, 2.3522, 10, 40)).toContain("FILTER(?sitelinks >= 40)");
  });
});

describe("classifySight exclusions", () => {
  it("rejects countries, settlements, universities and events that contain a sight word", () => {
    expect(classifySight("island country in East Asia")).toBeNull();
    expect(classifySight("city in Kyoto Prefecture, Japan")).toBeNull();
    expect(classifySight("public university in Tehran with a historic library")).toBeNull();
    expect(classifySight("Battle at the castle of Toba")).toBeNull();
    expect(classifySight("capital city with a famous park")).toBeNull();
  });

  it("still accepts places described by their city", () => {
    expect(classifySight("art museum in the city of Kyoto")).toBe("culture");
    expect(classifySight("Buddhist temple in Kyoto, Japan")).toBe("culture");
  });
});
