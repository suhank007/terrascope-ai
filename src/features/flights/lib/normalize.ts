import type { Flight } from "../types";

// adsb.fi (and the wider adsb.fi/airplanes.live/adsb.one family) share the
// same ADSBExchange-v2-compatible aircraft shape. Units are aviation units,
// not SI: alt_baro/alt_geom are feet (or the literal string "ground"), gs is
// knots, baro_rate/geom_rate are feet/minute. `seen` is seconds since the
// aircraft was last heard, relative to the response's top-level `now`.
interface AdsbAircraft {
  hex: string;
  flight?: string;
  desc?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  alt_geom?: number;
  gs?: number;
  track?: number;
  true_heading?: number;
  baro_rate?: number;
  geom_rate?: number;
  seen?: number;
}

export interface AdsbStatesResponse {
  now: number;
  ac: AdsbAircraft[] | null;
}

const FEET_TO_METERS = 0.3048;
const KNOTS_TO_MS = 0.514444;
const FPM_TO_MS = 0.00508;

export function normalizeFlights(raw: AdsbStatesResponse): Flight[] {
  if (!raw.ac) return [];

  const flights: Flight[] = [];

  for (const ac of raw.ac) {
    if (ac.lat === undefined || ac.lon === undefined) continue;

    const onGround = ac.alt_baro === "ground";
    const altitudeFt = onGround ? 0 : typeof ac.alt_baro === "number" ? ac.alt_baro : (ac.alt_geom ?? null);
    const verticalRateFpm = ac.baro_rate ?? ac.geom_rate ?? null;
    const lastContactMs = raw.now - (ac.seen ?? 0) * 1000;

    flights.push({
      icao24: ac.hex,
      callsign: ac.flight?.trim() || null,
      aircraftType: ac.desc ?? null,
      longitude: ac.lon,
      latitude: ac.lat,
      altitudeM: altitudeFt !== null ? altitudeFt * FEET_TO_METERS : null,
      onGround,
      velocityMs: ac.gs !== undefined ? ac.gs * KNOTS_TO_MS : null,
      trueTrack: ac.track ?? ac.true_heading ?? null,
      verticalRateMs: verticalRateFpm !== null ? verticalRateFpm * FPM_TO_MS : null,
      lastContact: new Date(lastContactMs).toISOString(),
    });
  }

  return flights;
}
