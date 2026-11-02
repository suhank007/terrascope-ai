import type { TravelMode } from "../types";

/** Everything that defines a trip, kept in the URL so a brief is shareable. */
export interface TripQuery {
  name: string;
  cc: string;
  lat: number;
  lon: number;
  home: string;
  mode: TravelMode;
  from?: string;
  to?: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function queryFromParams(params: URLSearchParams): TripQuery | null {
  const name = params.get("name")?.trim();
  const cc = params.get("cc")?.toUpperCase();
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  if (!name || !cc || cc.length !== 2 || !params.get("lat") || !params.get("lon")) return null;
  if (Number.isNaN(lat) || Number.isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

  const from = params.get("from");
  const to = params.get("to");
  return {
    name: name.slice(0, 80),
    cc,
    lat,
    lon,
    home: /^[A-Za-z]{3}$/.test(params.get("home") ?? "") ? params.get("home")!.toUpperCase() : "USD",
    mode: params.get("mode") === "business" ? "business" : "leisure",
    from: from && DATE.test(from) ? from : undefined,
    to: to && DATE.test(to) ? to : undefined,
  };
}

export function paramsFromQuery(query: TripQuery): URLSearchParams {
  const params = new URLSearchParams({
    name: query.name,
    cc: query.cc,
    lat: query.lat.toFixed(4),
    lon: query.lon.toFixed(4),
    home: query.home,
    mode: query.mode,
  });
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  return params;
}

/** The API only needs these; mode is purely a display choice, so toggling it never refetches. */
export function apiParams(query: TripQuery): URLSearchParams {
  const params = paramsFromQuery(query);
  params.delete("mode");
  return params;
}

/** Currencies the exchange-rate source (ECB via Frankfurter) publishes. */
export const HOME_CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "JPY", "CHF", "CNY"];

export const EXAMPLE_DESTINATIONS: Pick<TripQuery, "name" | "cc" | "lat" | "lon">[] = [
  { name: "Paris", cc: "FR", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo", cc: "JP", lat: 35.6762, lon: 139.6503 },
  { name: "Dubai", cc: "AE", lat: 25.2048, lon: 55.2708 },
  { name: "New York", cc: "US", lat: 40.7128, lon: -74.006 },
  { name: "Lisbon", cc: "PT", lat: 38.7223, lon: -9.1393 },
  { name: "Nairobi", cc: "KE", lat: -1.2921, lon: 36.8219 },
];
