import type { Flight } from "../types";

/** ICAO airline designators are always exactly 3 letters, e.g. "QTR123" -> "QTR". */
export function filterFlightsByAirlines(flights: Flight[], selectedPrefixes: ReadonlySet<string>): Flight[] {
  if (selectedPrefixes.size === 0) return flights;

  return flights.filter((flight) => {
    const callsign = flight.callsign?.trim();
    if (!callsign || callsign.length < 3) return false;
    return selectedPrefixes.has(callsign.slice(0, 3).toUpperCase());
  });
}
