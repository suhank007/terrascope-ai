export interface Airline {
  /** ICAO 3-letter airline designator — the callsign prefix broadcast in ADS-B, e.g. "QTR123". */
  icaoPrefix: string;
  name: string;
}

export const AIRLINES: Airline[] = [
  { icaoPrefix: "QTR", name: "Qatar Airways" },
  { icaoPrefix: "BAW", name: "British Airways" },
  { icaoPrefix: "AIC", name: "Air India" },
  { icaoPrefix: "UAE", name: "Emirates" },
  { icaoPrefix: "ETD", name: "Etihad Airways" },
  { icaoPrefix: "DLH", name: "Lufthansa" },
  { icaoPrefix: "AFR", name: "Air France" },
  { icaoPrefix: "KLM", name: "KLM" },
  { icaoPrefix: "SIA", name: "Singapore Airlines" },
  { icaoPrefix: "CPA", name: "Cathay Pacific" },
  { icaoPrefix: "QFA", name: "Qantas" },
  { icaoPrefix: "THY", name: "Turkish Airlines" },
  { icaoPrefix: "AAL", name: "American Airlines" },
  { icaoPrefix: "UAL", name: "United Airlines" },
  { icaoPrefix: "DAL", name: "Delta Air Lines" },
  { icaoPrefix: "ACA", name: "Air Canada" },
  { icaoPrefix: "RYR", name: "Ryanair" },
  { icaoPrefix: "EZY", name: "easyJet" },
  { icaoPrefix: "IGO", name: "IndiGo" },
  { icaoPrefix: "CCA", name: "Air China" },
];

const AIRLINES_BY_PREFIX = new Map(AIRLINES.map((airline) => [airline.icaoPrefix, airline.name]));

/**
 * Resolves a callsign to an airline name for the ~20 major carriers above.
 * Returns null for private/charter/military flights and anything else not
 * in the curated list — there's no reliable way to name every operator.
 */
export function getAirlineName(callsign: string | null): string | null {
  const trimmed = callsign?.trim();
  if (!trimmed || trimmed.length < 3) return null;
  return AIRLINES_BY_PREFIX.get(trimmed.slice(0, 3).toUpperCase()) ?? null;
}
