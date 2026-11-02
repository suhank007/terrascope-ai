import type { ForecastData, Severity } from "@/features/trip/types";

export type AirportSize = "large" | "medium" | "small";

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  /** Municipality with OurAirports' parenthetical detail removed ("Paris", not "Paris (Roissy-en-France)"). */
  city: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  elevationFt: number;
  size: AirportSize;
  website: string | null;
  wikipedia: string | null;
}

export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR";

export interface Metar {
  icao: string;
  observedAt: string;
  flightCategory: FlightCategory | null;
  tempC: number | null;
  /** Degrees, or "VRB" for variable. */
  windDir: number | "VRB" | null;
  windKt: number | null;
  gustKt: number | null;
  /** Statute miles, with 6+ / 10+ style readings reported as that number. */
  visibilitySm: number | null;
  ceilingFt: number | null;
  /** Decoded present weather, e.g. "light rain", "thunderstorm with rain". */
  weather: string[];
  raw: string;
}

export interface TafOutlook {
  /** Hours the summary covers, from now. */
  hours: number;
  worstCategory: FlightCategory | null;
  /** The worst category appears only in TEMPO / PROB groups, i.e. at times rather than throughout. */
  worstIsTemporary: boolean;
  thunderstorm: boolean;
  maxGustKt: number | null;
  weather: string[];
  raw: string;
  issuedAt: string;
}

export interface FaaDelay {
  kind: "Arrival" | "Departure";
  minMinutes: number | null;
  maxMinutes: number | null;
  trend: string | null;
  reason: string | null;
}

export interface FaaStatus {
  groundStop: { reason: string | null; endTime: string | null } | null;
  groundDelay: { reason: string | null; avgMinutes: number | null; maxMinutes: number | null } | null;
  delays: FaaDelay[];
  /** NOTAM text is informational: many closures are for general aviation only, so we never score them. */
  notices: { text: string; start: string | null; reopen: string | null }[];
  updatedAt: string | null;
}

export type TrafficPhase = "ground" | "arriving" | "departing" | "other";

export interface TrafficSample {
  callsign: string;
  aircraft: string | null;
  phase: TrafficPhase;
  altitudeFt: number | null;
  speedKt: number | null;
}

export interface AirportTraffic {
  radiusNm: number;
  total: number;
  onGround: number;
  arriving: number;
  departing: number;
  other: number;
  samples: TrafficSample[];
  /** True when the aircraft list hit adsb.fi's cap, so counts are a floor. */
  capped: boolean;
}

export interface OutlookReason {
  severity: Severity;
  text: string;
  source: string;
}

export interface Outlook {
  level: Severity;
  headline: string;
  reasons: OutlookReason[];
  /** What the outlook is built on, so the page never implies a delay feed it doesn't have. */
  basis: "faa-and-weather" | "weather-only";
  unchecked: string[];
}

export type AirportSection<T> = { status: "ok"; data: T } | { status: "unavailable"; reason: string };

export interface AirportBrief {
  airport: Airport;
  generatedAt: string;
  outlook: Outlook;
  metar: AirportSection<Metar>;
  taf: AirportSection<TafOutlook>;
  /** null outside the US: no free public delay feed exists, and the page says so. */
  faa: AirportSection<FaaStatus> | null;
  traffic: AirportSection<AirportTraffic>;
  forecast: AirportSection<ForecastData>;
}
