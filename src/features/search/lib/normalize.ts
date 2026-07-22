import type { GeocodeResult } from "../types";

// Nominatim's own field names — see https://nominatim.org/release-docs/latest/api/Search/
interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  addresstype?: string;
  type?: string;
  // [south, north, west, east], all as strings.
  boundingbox?: [string, string, string, string];
}

export function normalizeGeocodeResults(raw: NominatimResult[]): GeocodeResult[] {
  const results: GeocodeResult[] = [];

  for (const item of raw) {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) continue;

    const bbox = item.boundingbox
      ? {
          south: Number(item.boundingbox[0]),
          north: Number(item.boundingbox[1]),
          west: Number(item.boundingbox[2]),
          east: Number(item.boundingbox[3]),
        }
      : null;

    results.push({
      id: item.place_id,
      name: item.name?.trim() || item.display_name.split(",")[0].trim(),
      displayName: item.display_name,
      latitude,
      longitude,
      category: item.addresstype ?? item.type ?? null,
      bbox: bbox && Object.values(bbox).every((v) => !Number.isNaN(v)) ? bbox : null,
    });
  }

  return results;
}
