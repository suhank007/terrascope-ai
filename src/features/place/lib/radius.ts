import type { GeocodeResult } from "@/features/search/types";
import { haversineKm } from "@/features/trip/lib/geo";
import type { PlaceScope, SearchedPlace } from "../types";

/** A bbox wider than this reads as a region even when the geocoder gave no type. */
const REGION_SPAN_DEG = 3;
const CITY_QUAKE_KM = 300;
const CITY_FIRE_KM = 100;
const FALLBACK_REGION_CAP_KM = 400;

/** Nominatim place types that are bigger than a city, with how far from the
 *  centre point we are willing to look. Bounding boxes can't be trusted for
 *  this: Tokyo Prefecture's includes islands 1,000 km out to sea and France's
 *  spans the Pacific, so the cap is by type and the box only ever shrinks it. */
const REGION_CAP_KM: Record<string, number> = {
  country: 1000,
  state: 400,
  province: 400,
  region: 400,
  state_district: 400,
  territory: 400,
  county: 250,
};

export function placeFromResult(result: GeocodeResult): SearchedPlace {
  const { bbox, category } = result;
  const span = bbox ? Math.max(bbox.east - bbox.west, bbox.north - bbox.south) : 0;
  const typeCap = category ? REGION_CAP_KM[category] : undefined;
  const isRegion = typeCap !== undefined || (category === null && span > REGION_SPAN_DEG);
  const scope: PlaceScope = isRegion ? "region" : "city";

  let quakeRadiusKm = CITY_QUAKE_KM;
  let fireRadiusKm = CITY_FIRE_KM;
  if (isRegion) {
    const cap = typeCap ?? FALLBACK_REGION_CAP_KM;
    const half = bbox ? haversineKm(bbox.south, bbox.west, bbox.north, bbox.east) / 2 : cap;
    const radius = Math.round(Math.min(half, cap));
    // A small region still gets at least the local city radii.
    quakeRadiusKm = Math.max(radius, CITY_QUAKE_KM);
    fireRadiusKm = Math.max(radius, CITY_FIRE_KM);
  }

  return {
    name: result.name,
    displayName: result.displayName,
    countryCode: result.countryCode,
    latitude: result.latitude,
    longitude: result.longitude,
    scope,
    quakeRadiusKm,
    fireRadiusKm,
  };
}
