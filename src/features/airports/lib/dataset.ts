import { haversineKm } from "@/features/trip/lib/geo";
import raw from "../data/airports.json";
import type { Airport, AirportSize } from "../types";

/**
 * Server-side only: the JSON is ~630 KB, so import this from route handlers and
 * server code, never from a client component.
 *
 * Column order, as written by scripts/build-airports.mjs:
 * [iata, icao, name, municipality, countryCode, lat, lon, elevationFt, size, homeLink, wikipediaLink]
 */
type Row = [string, string, string, string, string, number, number, number, "L" | "M" | "S", string, string];

const SIZES: Record<Row[8], AirportSize> = { L: "large", M: "medium", S: "small" };

function toAirport(r: Row): Airport {
  return {
    iata: r[0],
    icao: r[1],
    name: r[2],
    city: r[3].replace(/\s*\(.*\)\s*$/, "").trim() || r[2],
    countryCode: r[4],
    latitude: r[5],
    longitude: r[6],
    elevationFt: r[7],
    size: SIZES[r[8]],
    website: r[9] || null,
    wikipedia: r[10] || null,
  };
}

const AIRPORTS: Airport[] = (raw as Row[]).map(toAirport);
const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata, a]));
const BY_ICAO = new Map(AIRPORTS.filter((a) => a.icao).map((a) => [a.icao, a]));

/** Look up by 3-letter IATA ("LHR") or 4-letter ICAO ("EGLL"), case-insensitive. */
export function getAirport(code: string): Airport | null {
  const key = code.trim().toUpperCase();
  return BY_IATA.get(key) ?? BY_ICAO.get(key) ?? null;
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const FOLDED = AIRPORTS.map((a) => ({ airport: a, city: fold(a.city), name: fold(a.name) }));

/**
 * Ranks airports for a search box: exact code first, then a city that starts
 * with the query, then a city or name that contains it. Larger airports win
 * ties because the dataset is sorted largest first.
 */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = fold(query.trim());
  if (q.length < 2) return [];

  const scored: { airport: Airport; score: number; index: number }[] = [];
  FOLDED.forEach(({ airport, city, name }, index) => {
    let score = 0;
    if (airport.iata.toLowerCase() === q) score = 100;
    else if (airport.icao.toLowerCase() === q) score = 90;
    else if (city === q) score = 80;
    else if (city.startsWith(q)) score = 70;
    else if (name.startsWith(q)) score = 60;
    else if (city.includes(q)) score = 50;
    else if (name.includes(q)) score = 40;
    if (score > 0) scored.push({ airport, score, index });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((s) => s.airport);
}

export interface NearbyAirport extends Airport {
  distanceKm: number;
}

/** The closest airports with scheduled service, nearest first. */
export function nearestAirports(latitude: number, longitude: number, count = 3, maxKm = 200): NearbyAirport[] {
  return AIRPORTS.map((a) => ({ ...a, distanceKm: Math.round(haversineKm(latitude, longitude, a.latitude, a.longitude)) }))
    .filter((a) => a.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}
