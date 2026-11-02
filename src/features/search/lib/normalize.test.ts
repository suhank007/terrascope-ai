import { describe, expect, it } from "vitest";
import { normalizeGeocodeResults } from "./normalize";

describe("normalizeGeocodeResults", () => {
  it("maps a Nominatim result to a GeocodeResult", () => {
    const [result] = normalizeGeocodeResults([
      {
        place_id: 123,
        lat: "48.8534951",
        lon: "2.3483915",
        name: "Paris",
        display_name: "Paris, Île-de-France, France",
        addresstype: "city",
        boundingbox: ["48.8155755", "48.9021560", "2.2241220", "2.4697602"],
      },
    ]);

    expect(result.id).toBe(123);
    expect(result.name).toBe("Paris");
    expect(result.latitude).toBeCloseTo(48.8534951);
    expect(result.longitude).toBeCloseTo(2.3483915);
    expect(result.category).toBe("city");
    expect(result.bbox).toEqual({
      south: 48.8155755,
      north: 48.902156,
      west: 2.224122,
      east: 2.4697602,
    });
  });

  it("falls back to the first segment of display_name when name is missing", () => {
    const [result] = normalizeGeocodeResults([
      {
        place_id: 1,
        lat: "10",
        lon: "20",
        display_name: "Somewhere, Some Region, Some Country",
      },
    ]);

    expect(result.name).toBe("Somewhere");
  });

  it("drops entries with a non-numeric lat/lon", () => {
    const results = normalizeGeocodeResults([
      { place_id: 1, lat: "not-a-number", lon: "20", display_name: "Bad" },
    ]);
    expect(results).toHaveLength(0);
  });

  it("returns a null bbox when boundingbox is missing", () => {
    const [result] = normalizeGeocodeResults([
      { place_id: 1, lat: "10", lon: "20", display_name: "No Box" },
    ]);
    expect(result.bbox).toBeNull();
  });
});

describe("normalizeGeocodeResults country", () => {
  const base = { place_id: 1, lat: "48.85", lon: "2.35", display_name: "Paris, France" };

  it("reads the country from addressdetails and upper-cases the code", () => {
    const [r] = normalizeGeocodeResults([{ ...base, address: { country: "France", country_code: "fr" } }]);
    expect(r.countryCode).toBe("FR");
    expect(r.countryName).toBe("France");
  });

  it("falls back to null when the country is missing or malformed", () => {
    expect(normalizeGeocodeResults([base])[0].countryCode).toBeNull();
    expect(normalizeGeocodeResults([{ ...base, address: { country_code: "xyz" } }])[0].countryCode).toBeNull();
  });
});
