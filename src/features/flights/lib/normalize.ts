import type { Flight } from "../types";

// OpenSky state vectors are positional arrays, not objects. Field order per the
// official REST docs (index -> meaning):
// 0 icao24, 1 callsign, 2 origin_country, 3 time_position, 4 last_contact,
// 5 longitude, 6 latitude, 7 baro_altitude, 8 on_ground, 9 velocity,
// 10 true_track, 11 vertical_rate, 12 sensors, 13 geo_altitude, 14 squawk,
// 15 spi, 16 position_source, 17 category
type OpenSkyStateVector = [
  string,
  string | null,
  string,
  number | null,
  number,
  number | null,
  number | null,
  number | null,
  boolean,
  number | null,
  number | null,
  number | null,
  unknown,
  number | null,
  string | null,
  boolean,
  number,
  number?,
];

export interface OpenSkyStatesResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

export function normalizeFlights(raw: OpenSkyStatesResponse): Flight[] {
  if (!raw.states) return [];

  const flights: Flight[] = [];

  for (const state of raw.states) {
    const longitude = state[5];
    const latitude = state[6];
    if (longitude === null || latitude === null) continue;

    flights.push({
      icao24: state[0],
      callsign: state[1]?.trim() || null,
      originCountry: state[2],
      longitude,
      latitude,
      altitudeM: state[7] ?? state[13] ?? null,
      onGround: state[8],
      velocityMs: state[9],
      trueTrack: state[10],
      verticalRateMs: state[11],
      lastContact: new Date(state[4] * 1000).toISOString(),
    });
  }

  return flights;
}
